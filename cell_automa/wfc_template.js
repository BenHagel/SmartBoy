function propogateNewTemplateObjectWRandomSeed(){
  
  //Get the value settings
  //Get settings from html objects

  //Get the grid from the templat sketch
  WFC_TEMPLATE_1 = WFC_getKernels(template_current_grid, [template_kernel_size] )
  WFC_TEMPLATE_2 = WFC_initGenerator(WFC_TEMPLATE_1, "randoSeed1_0")


  console.log(JSON.stringify(WFC_TEMPLATE_1))

}