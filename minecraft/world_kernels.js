var width=512;
var height=512
var radius=10;
var context_canvas = document.getElementById("canvForGPUToUse");
let frame;

var timeIndex = 0

class World {
    constructor() {
        const gpu = new GPU({
            canvas: context_canvas,
            mode: 'gpu'
        });

        const dim = 512;

        this.inicio = gpu.createKernel(
            function() {
                var val = Math.trunc(Math.random()*2)
                this.color(val,val,val);
            },
            {useLegacyEncoder:true,output:[dim, dim],graphical:true}
        );


        this.kernel = gpu.createKernel(
            function(m) {
            var s = 512
            var sum = 0;
            var h = this.thread.x
            var k =  s-1-this.thread.y
            var index = h*4+k*4*s
            var status=m[index]!=0?1:0;
            for(var j=-1;j<=1;j++){
                for(var i=-1;i<=1;i++){
                    var x = (h+i+s) % s;
                    var y = (k+j+s) % s;
                    sum+=m[x*4+y*4*s]!=0?1:0;
                }
            }

            sum-= status;
            var val=0;
            if (status==1 && (sum==3 || sum==2)) val=1;
            if (status==1 && ((sum<2) || (sum>3))) val=0;
            if (status==0 && sum==3) val=1;
            this.color(val,val,val);

            }, {useLegacyEncoder: true,output:[dim, dim],graphical: true}
        );

        this.cols=dim;
        this.rows=dim;
        this.grid = this.makegrid(this.cols,this.rows);
        this.newgrid = this.makeemptygrid(this.cols,this.rows);

        this.inicio();
        this.pixels = this.inicio.getPixels()

    }

    next(){
        this.kernel(this.pixels)
        this.pixels=this.kernel.getPixels();
    }

    draw(){
        this.next();
    }

    makeemptygrid(cols,rows){
        var grid = new Array(cols);
        for(var i =0;i<cols;i++){
            grid[i]=(new Array(rows)).fill(0);
        }
        return grid;
    }


    makegrid(cols,rows){
        var grid = new Array(cols);
        for(var i =0;i<cols;i++){
            grid[i]=(new Array(rows)).fill(0).map(a=>Math.trunc(Math.random()*2));
        }
        return grid;
    }
}


//return context_canvas;