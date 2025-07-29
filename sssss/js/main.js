tx = {}
renderer = {}
mesh = {}


function setup_tex_quad(texture) {
    create_dummy_texture();
    const vertex_module = renderer.device.createShaderModule({
        label: "vert_quad_shader",
        code: get_shader("screen_quad_vert"),
    });
    const fragment_module = renderer.device.createShaderModule({
        label: "frag_quad_shader",
        code: get_shader("screen_quad_frag"),
    });


    const pipeline = renderer.device.createRenderPipeline({
        label: "Simple Quad",
        layout: 'auto',
        vertex: {
            entryPoint: 'vs',
            module: vertex_module,
        },
        fragment: {
            entrypoint: 'fs',
            module: fragment_module,
            targets: [{ format: renderer.presentation_format }]
        },
        primitive: {
            cullMode: 'none',
        },
        depthStencil: {
            depthWriteEnabled: false,
            depthCompare: 'always',
            format: 'depth24plus'
        }
    });
    const bind_group = renderer.device.createBindGroup({
        label: "simple quad bind group",
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: renderer.shadows[0].texture.createView() }
        ]
    });


    renderer.tex_quad = {
        bind_group: bind_group,
        pipeline: pipeline,

        draw: function(pass) {
            pass.setPipeline(this.pipeline);
            pass.setBindGroup(0, this.bind_group);
            pass.draw(3);
        }
    };

}








function setup_instances() {
    renderer.n_instances = 10;
    const buffer_size = 16;
    renderer.storage_buffer = renderer.device.createBuffer({
        size: renderer.n_instances * buffer_size * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });
    renderer.storage_values = new Float32Array(buffer_size * renderer.n_instances);
}
function setup_uniforms() {
    renderer.mvp_uniform = create_uniforms([{ size: 4 * 4 * 4 }])[0];
    renderer.dir_light_info = create_uniforms([{ size: 4 + 4 * 16 }])[0];
}

function set_uniform() {
    let fov = ui_control.variables.thfovy.value;
    let mat = mat4.transpose(mat4.perspective(1.33333, fov, 0.01, 100.0));
    let mat_inv = mat4.transpose(mat4.perspectiveInv(1.33333, 0.15, 0.01, 100.0));

    mat4.print(mat4.multiply(mat_inv, mat));

    let u = ui_control.variables.vertical.value;
    let v = ui_control.variables.horizontal.value;
    let zoom = ui_control.variables.zoom.value;

    let view = create_view(
        vec3.create(Math.cos(v) * Math.sin(u) * zoom, Math.sin(v) * Math.sin(u) * zoom, Math.cos(u) * zoom),
        vec3.create(0.0, 0.0, 0.0),
        vec3.create(0.0, 0.0, 1.0));
    let view_inv = mat4.rigid_inverse(view);
    view = mat4.transpose(view);
    view_inv = mat4.transpose(view_inv);
    renderer.mvp_uniform.values.set(mat, 0);
    renderer.mvp_uniform.values.set(view, 4 * 4);
    renderer.mvp_uniform.values.set(mat_inv, 2 * 4 * 4);
    renderer.mvp_uniform.values.set(view_inv, 3 * 4 * 4);

    renderer.dir_light_info.values.set([1.0, 1.0, 1.0, 0.0], 0);
    renderer.dir_light_info.values.set(renderer.shadows[0].projection, 4);
    renderer.dir_light_info.values.set(renderer.shadows[0].projection_inv, 16 + 4);
    renderer.dir_light_info.values.set(renderer.shadows[0].view, 16 * 2 + 4);
    renderer.dir_light_info.values.set(renderer.shadows[0].view_inv, 16 * 3 + 4);
}

function set_storage() {
    for (let i = 0; i < renderer.n_instances; i++) {
        //let mat = mat4.translate([Math.sin(i / renderer.n_instances * 2.0 * Math.PI), 0.0, Math.cos(i / renderer.n_instances * 2.0 * Math.PI) - 3.0]);

        //let s = 0.3 + Math.sin(clock) * 0.15;
        //s = 3.0;
        //mat = mat4.multiply(mat, mat4.scale([s, s, s]));
        mat = mat4.rotateX(Math.PI * 0.5);
        renderer.storage_values.set(mat4.transpose(mat), i * 16);
    }
}

function set_vertex_data2() {
    renderer.vertex_data = new Float32Array(4 * 3);
    renderer.vertex_data.set([-1.0, -1.0, 0.0], 0);
    renderer.vertex_data.set([1.0, -1.0, 0.0], 3);
    renderer.vertex_data.set([-1.0, 1.0, 0.0], 6);
    renderer.vertex_data.set([1.0, 1.0, 0.0], 9);
    renderer.index_data = new Uint32Array([0, 1, 3, 0, 3, 2]);

}

function set_vertex_data() {
    const vertex_size = 3;

    const x_res = 32;
    const y_res = 16;

    const n_vertices = x_res * y_res + 2;
    const n_tris = 2 * x_res + (y_res - 1) * x_res * 2;
    renderer.vertex_data = new Float32Array(vertex_size * n_vertices);
    let idx = 0;
    renderer.vertex_data.set([0.0, 0.0, -1.0], (idx++) * 3);
    for (let i = 0; i < y_res; i++) {
        let v = (i + 1) / (y_res + 2);
        v = 1.0 - v;
        v = v * Math.PI;
        let cv = Math.cos(v);
        let sv = Math.sin(v);

        for (let j = 0; j < x_res; j++) {
            let u = j / x_res;
            u = u * 2.0 * Math.PI;
            let cu = Math.cos(u);
            let su = Math.sin(u);
            renderer.vertex_data.set([cu * sv, su * sv, cv], (idx++) * 3);

        }
    }
    renderer.vertex_data.set([0.0, 0.0, 1.0], (idx++) * 3);


    //setting up the indices:
    //First Fan
    renderer.index_data = new Uint32Array(n_tris * 3);
    idx = 0;
    for (let i = 0; i < x_res; i++) {
        let a = 0;
        let b = i + 1;
        let c = 1 + (i + 1) % x_res;
        renderer.index_data.set([a, b, c], (idx++) * 3);
    }
    for (let i = 0; i < y_res - 1; i++) {
        for (let j = 0; j < x_res; j++) {
            let a = 1 + i * x_res + j;
            let b = 1 + i * x_res + (j + 1) % x_res;
            let c = a + x_res;
            let d = b + x_res;

            renderer.index_data.set([a, b, d], (idx++) * 3);
            renderer.index_data.set([a, d, c], (idx++) * 3);
        }
    }
    for (let i = 0; i < x_res; i++) {
        let a = 1 + x_res * (y_res - 1) + i;
        let b = 1 + x_res * (y_res - 1) + (i + 1) % x_res;
        let c = 1 + x_res * y_res;
        renderer.index_data.set([a, b, c], (idx++) * 3);
    }



    /*
        renderer.vertex_data.set([0.0, 0.5, 0.0], 0);
        renderer.vertex_data.set([-0.5, 0.5, 0.0], 3);
        renderer.vertex_data.set([0.5, -0.5, 0.0], 6);
    */
}



async function setup_static_geometry() {
    mesh = await parse_mesh("scenes/head.msh");
    let vertex_size = (3 + 3 + 2 + 3);
    renderer.vertex_data = new Float32Array(mesh.verts.length * 11);
    renderer.index_data = new Uint32Array(mesh.indices.length * 3);


    for (let i = 0; i < mesh.verts.length; i++) {
        renderer.vertex_data.set(
            [
                mesh.verts[i][0],
                mesh.verts[i][1],
                mesh.verts[i][2],
                mesh.normals[i][0],
                mesh.normals[i][1],
                mesh.normals[i][2],
                mesh.uvs[i][0],
                mesh.uvs[i][1],
                mesh.tangents[i][0],
                mesh.tangents[i][1],
                mesh.tangents[i][2]], i * 11);
    }

    for (let i = 0; i < mesh.indices.length; i++) {
        renderer.index_data.set([
            mesh.indices[i][0],
            mesh.indices[i][1],
            mesh.indices[i][2]], i * 3);
    }
}
function setup_vertex_buffer() {
    renderer.vertex_buffer = renderer.device.createBuffer({
        label: "vertex buffer",
        size: renderer.vertex_data.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    renderer.device.queue.writeBuffer(renderer.vertex_buffer, 0, renderer.vertex_data);

    renderer.index_buffer = renderer.device.createBuffer({
        label: "index buffer",
        size: renderer.index_data.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
    });
    renderer.device.queue.writeBuffer(renderer.index_buffer, 0, renderer.index_data);
}

function create_uniforms(u) {
    let ret = [];
    for (let i = 0; i < u.length; i++) {

        const buffer_size = u[i].size;
        let help = {
            buffer: renderer.device.createBuffer({
                size: buffer_size * 4,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }),
            values: new Float32Array(buffer_size)

        }
        ret.push(help);
    }
    return ret;
}


function create_program_object(shader_name, args) {
    let ret = {}


    let shader_name_basis = args.cleanName ? args.cleanName : shader_name;


    const module = renderer.device.createShaderModule({
        label: shader_name_basis + " Shader",
        code: get_shader(shader_name)
    });

    let pipeline_info = {
        label: shader_name_basis + " Pipeline",
        layout: 'auto',
        primitive: {
            cullMode: 'none'
        },
        vertex: {
            entryPoint: 'vs',
            module,
            buffers: []
        }
    }

    if (args.vertex_attributes) {
        let buffer = {};

        buffer.attributes = []
        buffer.arrayStride = args.vertex_size * 4;
        for (let i = 0; i < args.vertex_attributes.length; i++) {
            buffer.attributes.push({ shaderLocation: args.vertex_attributes[i].loc, offset: args.vertex_attributes[i].offset, format: args.vertex_attributes[i].format });
        }
        pipeline_info.vertex.buffers.push(buffer);
    }

    if (args.depth) {
        let depth_format = 'depth32float';
        if (args.stencil) {
            depth_format = 'depth24plus';
        }

        pipeline_info.depthStencil = {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: depth_format
        }
    }
    if (args.colors) {
        pipeline_info.fragment = {
            entrypoint: 'fs',
            module,
            targets: []
        }
        for (let i = 0; i < args.colors.length; i++) {
            pipeline_info.fragment.targets.push({
                format: args.colors[i].format
            });
        }
    }


    ret.pipeline = renderer.device.createRenderPipeline(pipeline_info);
    ret.render_pass_descriptor = {
        label: shader_name_basis + " Render pass",
    }

    if (args.depth) {
        ret.render_pass_descriptor.depthStencilAttachment = {
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            view: args.depth.view,
        }
    }
    ret.render_pass_descriptor.colorAttachments = [];
    if (args.colors) {
        for (let i = 0; i < args.colors.length; i++) {
            ret.render_pass_descriptor.colorAttachments.push({
                clearValue: [0.0, 0.0, 0.0, 1.0],
                loadOp: 'clear',
                storeOp: 'store',
                view: args.colors[i].view
            });
        }
    }
    return ret;

}


var ui_control = {
    keys: {},
    variables: {
        horizontal: acceleratedVariable(2.0, 10.0, -0.80),
        vertical: acceleratedVariable(2.0, 10.0, Math.PI / 2, 0.1, Math.PI - 0.1),
        zoom: acceleratedVariable(2.0, 1.0, 1.0, 0.2, 5.0),
        thfovy: acceleratedVariable(2.0, 1.0, 0.15, 0.05, 2.0),
        light_horizontal: acceleratedVariable(2.0, 10.0, 0.80),
        light_vertical: acceleratedVariable(2.0, 10.0, Math.PI / 2, 0.1, Math.PI - 0.1),
        sss_radius: { value: 0.001, update: function() { } }
    },
    update: function(dt) {
        if (this.keys.KeyA && this.keys.KeyA.down) {
            this.variables.horizontal.add(1.0, dt);
        }
        if (this.keys.KeyD && this.keys.KeyD.down) {
            this.variables.horizontal.add(-1.0, dt);
        }
        if (this.keys.KeyW && this.keys.KeyW.down) {
            this.variables.vertical.add(1.0, dt);
        }
        if (this.keys.KeyS && this.keys.KeyS.down) {
            this.variables.vertical.add(-1.0, dt);
        }
        if (this.keys.KeyQ && this.keys.KeyQ.down) {
            this.variables.zoom.add(1.0, dt);
        }
        if (this.keys.KeyE && this.keys.KeyE.down) {
            this.variables.zoom.add(-1.0, dt);
        }
        if (this.keys.KeyZ && this.keys.KeyZ.down) {
            this.variables.thfovy.add(1.0, dt);
        }
        if (this.keys.KeyX && this.keys.KeyX.down) {
            this.variables.thfovy.add(-1.0, dt);
        }
        for (var k in this.variables) {
            this.variables[k].update(dt);
        }
        if (this.keys.KeyG && this.keys.KeyG.down) {
            this.variables.light_horizontal.add(1.0, dt);
        }
        if (this.keys.KeyJ && this.keys.KeyJ.down) {
            this.variables.light_horizontal.add(-1.0, dt);
        }
        if (this.keys.KeyY && this.keys.KeyY.down) {
            this.variables.light_vertical.add(1.0, dt);
        }
        if (this.keys.KeyH && this.keys.KeyH.down) {
            this.variables.light_vertical.add(-1.0, dt);
        }
    }
};

document.addEventListener("keydown", function(e) {
    ui_control.keys[e.code] = { down: true };
});
document.addEventListener("keyup", function(e) {
    ui_control.keys[e.code] = { down: false };
});

function clamp(x, a, b) {
    if (x < a) {
        return a;
    }
    if (x > b) {
        return b;
    }
    return x;
}

function acceleratedVariable(decay, rate, init, max, min) {
    return {
        speed: 0.0,
        value: init,
        add: function(value, dt) {
            this.speed += rate * value * dt;
        },
        update: function(dt) {
            let old_value = this.value;
            this.value += this.speed * dt;
            if (max != undefined && min != undefined) {
                this.value = clamp(this.value, max, min);
            }
            this.speed = (this.value - old_value) / dt
            this.speed = this.speed * Math.exp(-decay * dt);
        }
    }
}







function setup_shadow_pipeline() {
    let sm_size = 2048;
    renderer.shadows = [{}];

    renderer.shadows[0].texture = renderer.device.createTexture({
        size: [sm_size, sm_size],
        format: 'depth32float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });
    let depth_texture = renderer.shadows[0].texture;

    renderer.shadows[0].uniforms = create_uniforms([{ size: 2 * 4 * 4 }]);
    renderer.shadows[0].program = create_program_object("shadow_shader", {
        cleanName: "Shadowmap",
        vertex_size: 11,
        vertex_attributes: [{
            loc: 0, offset: 0, format: 'float32x3'
        }],
        depth: { view: depth_texture.createView() },
    });

    renderer.shadows[0].bind_group = renderer.device.createBindGroup({
        layout: renderer.shadows[0].program.pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: renderer.shadows[0].uniforms[0].buffer } },
            { binding: 1, resource: { buffer: renderer.storage_buffer } }
        ]
    });

}


function update_uniform(u) {
    renderer.device.queue.writeBuffer(u.buffer, 0, u.values);
}

function update_shadow_buffers() {
    set_shadow_uniforms();
    update_uniform(renderer.shadows[0].uniforms[0]);
}


function create_view(o, at, up) {
    //todo: switch sign? Probably not
    let z = vec3.normalize(vec3.subtract(o, at));
    let x = vec3.normalize(vec3.cross(up, z));
    let y = vec3.normalize(vec3.cross(z, x));

    //world to view
    let view = (mat4.create(
        x[0], x[1], x[2], 0,
        y[0], y[1], y[2], 0,
        z[0], z[1], z[2], 0,
        0, 0, 0, 1
    ))
    let o2 = mat4.multiplyByPoint3(view, vec3.symmetric(o));
    view[3] = o2[0];
    view[7] = o2[1];
    view[11] = o2[2];

    //the view matrix is T' R^-1
    //T' = R^-1 T(at)
    return view;
}

function set_shadow_uniforms() {
    let mat4size = (4 * 4);
    let mat = mat4.transpose(mat4.ortho(-0.4, 0.4, -0.4, 0.4, -0.4, 0.4));

    //let view = create_view(vec3.create(0.0, 0.0, 0.0), vec3.create(Math.cos(clock), Math.sin(clock), -0.4), vec3.create(0.0, 0.0, 1.0));
    //let view = create_view(vec3.create(0.0, 0.0, 0.0), vec3.create(1.0, 1.0, -0.4), vec3.create(0.0, 0.0, 1.0));
    let u = ui_control.variables.light_vertical.value;
    let v = ui_control.variables.light_horizontal.value;
    let view = create_view(vec3.create(0.0, 0.0, 0.0), vec3.create(Math.cos(v) * Math.sin(u), Math.sin(v) * Math.sin(u), Math.cos(u)), vec3.create(0.0, 0.0, 1.0));
    view = mat4.transpose(view);

    renderer.shadows[0].projection = mat;
    renderer.shadows[0].projection_inv = mat;

    renderer.shadows[0].view = view;
    renderer.shadows[0].view_inv = view;

    renderer.shadows[0].uniforms[0].values.set(mat, 0);
    renderer.shadows[0].uniforms[0].values.set(view, mat4size);



}



function make_bind_group(pipeline, i, entries) {
    return renderer.device.createBindGroup({
        layout: pipeline.getBindGroupLayout(i),
        entries: entries
    });
}

function setup_main_pass() {

    let canvas_tex = ctx.getCurrentTexture();
    renderer.main_pass = {};
    renderer.main_pass.depth = renderer.device.createTexture({
        size: [canvas_tex.width, canvas_tex.height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });
    renderer.main_pass.diffuse = renderer.device.createTexture({
        size: [canvas_tex.width, canvas_tex.height],
        format: 'rgba16float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });
    renderer.main_pass.specular = renderer.device.createTexture({
        size: [canvas_tex.width, canvas_tex.height],
        format: 'rgba16float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });


    let depth_texture = renderer.main_pass.depth;

    renderer.main_pass.program = create_program_object("triangle_shader", {
        cleanName: "MainPass",
        vertex_size: 11,
        vertex_attributes: [
            { loc: 0, offset: 0, format: 'float32x3' },
            { loc: 1, offset: 3 * 4, format: 'float32x3' },
            { loc: 2, offset: 6 * 4, format: 'float32x2' },
            { loc: 3, offset: 8 * 4, format: 'float32x3' },
        ],
        colors: [
            { format: 'rgba16float', view: renderer.main_pass.diffuse.createView() },
            { format: 'rgba16float', view: renderer.main_pass.specular.createView() },
        ],
        depth: { view: depth_texture.createView() },
        stencil: true

    });

    renderer.main_pass.bind_groups = [];
    let gs = renderer.main_pass.bind_groups;
    gs.push(
        make_bind_group(renderer.main_pass.program.pipeline, 0, [
            { binding: 0, resource: { buffer: renderer.mvp_uniform.buffer } },
            { binding: 1, resource: { buffer: renderer.storage_buffer } }
        ]));
    gs.push(
        make_bind_group(renderer.main_pass.program.pipeline, 1, [
            { binding: 1, resource: renderer.albedo_texture.createView() },
            { binding: 2, resource: renderer.bump_texture.createView() },
            { binding: 0, resource: renderer.sampler }
        ]));
    gs.push(
        make_bind_group(renderer.main_pass.program.pipeline, 2, [
            { binding: 0, resource: { buffer: renderer.dir_light_info.buffer } },
            { binding: 1, resource: renderer.shadows[0].texture.createView() },
        ]));

}

function setup_sss_blur_pass() {
    let canvas_tex = ctx.getCurrentTexture();
    renderer.blur_pass = { passes: [{}, {}] };

    renderer.blur_pass.back = renderer.device.createTexture({
        size: [canvas_tex.width, canvas_tex.height],
        format: 'rgba16float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });


    //sss uniform has:
    // ((n-1)/2 + 1)*vec4
    // float radius
    // vec3 pad
    renderer.blur_pass.sss_uniform = create_uniforms([{ size: 6 * 4 + 4 }])[0];
    for (let i = 0; i < 2; i++) {

        let pass = renderer.blur_pass.passes[i];
        pass.uniform = create_uniforms([{ size: 1 }])[0];
        let attachment = renderer.blur_pass.back.createView();
        let texture = renderer.main_pass.diffuse.createView();

        if (i == 1) {
            let tmp = attachment;
            attachment = texture;
            texture = tmp;
        }

        pass.program = create_program_object("sss_blur", {
            cleanName: "SSS Blur",
            colors: [{
                format: 'rgba16float', view: attachment
            }]
        });
        pass.bind_groups = [];
        pass.bind_groups.push(make_bind_group(pass.program.pipeline, 0, [
            { binding: 0, resource: renderer.sampler },
            { binding: 1, resource: texture },
            { binding: 2, resource: renderer.main_pass.depth.createView() },
            { binding: 3, resource: { buffer: pass.uniform.buffer } }
        ]));
        pass.bind_groups.push(make_bind_group(pass.program.pipeline, 1, [
            { binding: 0, resource: { buffer: renderer.blur_pass.sss_uniform.buffer } }
        ]));
        pass.bind_groups.push(make_bind_group(pass.program.pipeline, 2, [
            { binding: 0, resource: { buffer: renderer.mvp_uniform.buffer } }
        ]));


    }
}

function setup_final_pass() {

    let canvas_tex = ctx.getCurrentTexture();
    renderer.final_pass = {};
    let pass = renderer.final_pass;
    pass.program = create_program_object("final", {
        cleanName: "FinalPass",
        colors: [{ format: renderer.presentation_format, view: canvas_tex.createView() }]
    });
    pass.bind_group = make_bind_group(pass.program.pipeline, 0, [
        { binding: 0, resource: renderer.sampler },
        { binding: 1, resource: renderer.main_pass.diffuse.createView() },
        { binding: 2, resource: renderer.main_pass.specular.createView() }
    ]);
}


async function setup() {
    const adapter = await navigator.gpu?.requestAdapter();
    renderer.device = await adapter?.requestDevice();


    const canvas = document.getElementById("main_canvas")
    canvas.width = canvas.style.width = 1024;
    canvas.height = canvas.style.width = 800;
    renderer.resolution = [canvas.width, canvas.height];
    ctx = canvas.getContext("webgpu");
    if (!ctx) {
        let div = document.createElement("div");
        div.id = "main_canvas";
        div.style.background = "black";
        div.innerHTML = "Your Browser Does Not Support WebGPU :("
        canvas.replaceWith(div);
        return;
    }
    renderer.presentation_format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({
        device: renderer.device,
        format: renderer.presentation_format
    });

    setup_uniforms();
    setup_instances();
    await setup_static_geometry();
    setup_vertex_buffer();
    await setup_textures();

    setup_shadow_pipeline();
    setup_main_pass();
    setup_sss_blur_pass();
    setup_final_pass();

    setup_tex_quad()
    goodToGo = true;


}
async function load_image(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return await createImageBitmap(blob, { colorSpaceConversion: 'none' });
}

async function create_texture(url, monochrome, srgb) {
    const source = await load_image(url);
    const texture = renderer.device.createTexture({
        label: url,
        format: monochrome ? 'r8unorm' : srgb ? 'rgba8unorm-srgb' : 'rgba8unorm',
        size: [source.width, source.height],
        usage: GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
    });
    renderer.device.queue.copyExternalImageToTexture({ source, flipY: true }, { texture }, { width: source.width, height: source.height });
    return texture;

}

function create_dummy_texture() {
    renderer.dummy_texture = renderer.device.createTexture({
        label: "dummy",
        format: 'rgba8unorm',
        size: [64, 64],
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
}


async function setup_textures() {
    renderer.albedo_texture = await create_texture("scenes/lambertian.jpg", false, true);
    renderer.bump_texture = await create_texture("scenes/bump-lowRes.png", true);
    renderer.sampler = renderer.device.createSampler();
}

let imp_samp_gauss = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];

let fn = function(x) {
    return Math.exp(-x * x);
}
function fill_imp_samp() {
    let sum = 0.0;


    for (let x = 0; x < 3.0; x += 0.02) {
        sum += fn(x);
    }

    let td = 1.0 / (imp_samp_gauss.length - 0.5);

    let tg = td;
    let i = 1;
    let sum2 = 0.0;
    for (let x = 0; x < 3.0; x += 0.02) {
        sum2 += fn(x);
        while (sum2 / sum >= tg) {
            imp_samp_gauss[i] = x;
            i++;
            tg += td;
        }
    }
}


fill_imp_samp();


function set_sss_uniforms() {
    let sigmas = [0.8 / 0.8, 0.2 / 0.8, 0.1 / 0.8];

    let arr = [];
    for (let i = 0; i < imp_samp_gauss.length; i++) {
        for (let j = 0; j < 3; j++) {
            arr.push(fn(imp_samp_gauss[i] / (sigmas[j])));
        }
        arr.push(imp_samp_gauss[i]);
    }
    arr.push(ui_control.variables.sss_radius.value);

    renderer.blur_pass.sss_uniform.values.set(arr, 0);


    renderer.blur_pass.passes[0].uniform.values.set([0.0], 0);
    renderer.blur_pass.passes[1].uniform.values.set([1.0], 0);



    //exp(-sigma*x*x)
}

function update_buffers() {
    set_uniform();
    set_storage();
    update_uniform(renderer.mvp_uniform);
    update_uniform(renderer.dir_light_info);

    set_sss_uniforms();
    for (let i = 0; i < 2; i++) {
        update_uniform(renderer.blur_pass.passes[i].uniform);
    }
    update_uniform(renderer.blur_pass.sss_uniform);
    renderer.device.queue.writeBuffer(renderer.storage_buffer, 0, renderer.storage_values);

}

function shadow_render() {
    let render_pass = renderer.shadows[0].program.render_pass_descriptor;
    render_pass.depthStencilAttachment.view = renderer.shadows[0].texture.createView();

    const pass = renderer.encoder.beginRenderPass(render_pass);
    pass.setPipeline(renderer.shadows[0].program.pipeline);
    pass.setVertexBuffer(0, renderer.vertex_buffer);
    pass.setIndexBuffer(renderer.index_buffer, 'uint32');
    pass.setBindGroup(0, renderer.shadows[0].bind_group);
    pass.drawIndexed(renderer.index_data.length, 1);

    pass.end();

}
function sss_pass_render(i) {
    let render_pass = renderer.sss_pass[i].program.render_pass_descriptor;
    const pass = renderer.encoder.beginRenderPass(render_pass);
    pass.setPipeline(renderer.sss_pass[i].program.pipeline);
    pass.setBindGroup(0, renderer.sss_pass[i].bind_group);
    pass.draw(3);
    pass.end();
}

function final_render() {
    let render_pass = renderer.final_pass.program.render_pass_descriptor;
    const pass = renderer.encoder.beginRenderPass(render_pass);
    pass.setPipeline(renderer.final_pass.program.pipeline);
    pass.setBindGroup(0, renderer.final_pass.bind_group);
    pass.draw(3);
    pass.end();

}



function main_render() {

    const pass = renderer.encoder.beginRenderPass(renderer.main_pass.program.render_pass_descriptor);
    /*
    for(let i: renderer.pipeline_objs){
        let pl = renderer.pipeline_objs[i];
        pass.setPipeline(pl.pipeline);
        for (let j: pl.objects){
            let obj = pl.objects[j];
            pass.setVertexBuffer(0,obj.vertex_buffer);
            pass.setIndexBuffer(obj.index_buffer,'uint32');
            pass.setBindGroup(0, obj.bind_group);
            pass.drawIndexed(obj.index_buffer.length, obj.n_instances);
        }
        pass.end();
    }
    */

    pass.setPipeline(renderer.main_pass.program.pipeline);
    pass.setVertexBuffer(0, renderer.vertex_buffer);
    pass.setIndexBuffer(renderer.index_buffer, 'uint32');
    for (let i = 0; i < renderer.main_pass.bind_groups.length; i++) {
        pass.setBindGroup(i, renderer.main_pass.bind_groups[i]);
    }
    pass.drawIndexed(renderer.index_data.length, 1);

    //renderer.tex_quad.draw(pass);
    pass.end();


}
function sss_render() {
    for (let i = 0; i < 2; i++) {
        let rpd = renderer.blur_pass.passes[i].program.render_pass_descriptor;
        const pass = renderer.encoder.beginRenderPass(rpd);

        pass.setPipeline(renderer.blur_pass.passes[i].program.pipeline);
        for (let j = 0; j < 3; j++) {
            pass.setBindGroup(j, renderer.blur_pass.passes[i].bind_groups[j]);
        }
        pass.draw(3);
        pass.end();
    }
}


function do_render_command() {


    renderer.encoder = renderer.device.createCommandEncoder({ label: "Enc" });


    shadow_render();
    main_render();

    sss_render();
    final_render();
    const commandBuffer = renderer.encoder.finish();
    renderer.device.queue.submit([commandBuffer]);

}

function update_final_attachments() {
    renderer.final_pass.program.render_pass_descriptor.colorAttachments[0].view = ctx.getCurrentTexture().createView();
}

function render_loop(dt) {

    clock = dt * 0.001;
    ui_control.update(1.0 / 60.0);


    update_shadow_buffers()
    update_buffers()

    update_final_attachments()
    do_render_command();


    requestAnimationFrame(render_loop);
}

var clock = 0

var goodToGo = false;

async function main() {
    await load_shaders()
    await setup()
    if (!goodToGo) {
        return;
    }

    render_loop(0)
    //let ctx = canvas.getContext("2d");
    //ctx.fillStyle = "#0000ff";
    //ctx.rect(0, 0, canvas.width, canvas.height);
    //ctx.fill();
}
main()
