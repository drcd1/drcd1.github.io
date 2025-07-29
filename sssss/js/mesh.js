var Mesh = {
    create: function(verts, normals, uvs, tangents, indices) {
        return {
            verts: verts,
            normals: normals,
            tangents: tangents,
            uvs: uvs,
            indices: indices,
        }
    },
    sphere: function(x_res, y_res) {
        const n_vertices = x_res * y_res + 2;
        const n_tris = 2 * x_res + (y_res - 1) * x_res * 2;
        renderer.vertex_data = new Float32Array(vertex_size * n_vertices);
        let idx = 0;
        let verts = []
        let normals = []
        let uvs = []
        let indices = []
        verts = verts.push([0.0, 0.0, -1.0]);
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
                verts = verts.push([cu * sv, su * sv, cv]);
            }
        }
        verts = verts.push([0.0, 0.0, 1.0]);
        for (let i = 0; i < x_res; i++) {
            let a = 0;
            let b = i + 1;
            let c = 1 + (i + 1) % x_res;

            indices.push([a, b, c]);
        }
        for (let i = 0; i < y_res - 1; i++) {
            for (let j = 0; j < x_res; j++) {
                let a = 1 + i * x_res + j;
                let b = 1 + i * x_res + (j + 1) % x_res
                let c = a + x_res;
                let d = b + x_res;
                renderer.index_data.set([a, b, d])
                renderer.index_data.set([a, d, c])
            }
        }
        for (let i = 0; i < x_res; i++) {
            let a = 1 + x_res * (y_res - 1) + i;
            let b = 1 + x_res * (y_res - 1) + (i + 1) % x_res;

            let c = 1 + x_res * y_res;
            renderer.index_data.set([a, b, c], (idx++) * 3);
        }




        for (let i in verts) {
            normals.push(vec3.normalized(verts));
            let x = normals[i][0]
            let y = normals[i][1]
            let z = normals[i][2]
            uvs.push(vec2.create(Math.atan2(x, z) / (2.0 * M_PI),
                Math.acos(z, Math.sqrt(x * x, z * z)) / (M_PI)))



        }



        return Mesh.create(verts, normals, uvs, indices);
    }


}
