

async function load_shader(name) {
    const tmp = await fetch(name);
    return tmp.text();
}


var shaders = {};
async function load_shaders() {
    shaders.shadow_shader = await load_shader("js/shaders/shadows.wgsl");
    shaders.triangle_shader = await load_shader("js/shaders/standard.wgsl");
    shaders.screen_quad_vert = await load_shader("js/shaders/screen_quad.vs.wgsl");
    shaders.screen_quad_frag = await load_shader("js/shaders/screen_quad.fs.wgsl");
    shaders.final = await load_shader("js/shaders/final.wgsl");
    shaders.sss_blur = await load_shader("js/shaders/sss_blur.wgsl");

}


function get_shader(name) {
    console.log(shaders[name]);
    return shaders[name];
}
