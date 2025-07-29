var vec3 = {
    create: function(a, b, c) {
        return [a, b, c];
    },
    symmetric: function(a) {
        return [-a[0], -a[1], -a[2]];
    },
    add: function(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    },
    subtract: function(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    },
    dot: function(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },
    cross: function(a, b) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    },
    lenSqr: function(a) {
        return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
    },
    len: function(a) {
        return Math.sqrt(this.lenSqr(a));
    },
    multiplyByScalar: function(a, b) {
        return [a[0] * b, a[1] * b, a[2] * b];
    },
    normalize: function(a) {
        return this.multiplyByScalar(a, 1.0 / this.len(a));
    }

}


var mat4 = {
    create: function(a00, a10, a20, a30,
        a01, a11, a21, a31,
        a02, a12, a22, a32,
        a03, a13, a23, a33) {
        return [a00, a10, a20, a30,
            a01, a11, a21, a31,
            a02, a12, a22, a32,
            a03, a13, a23, a33];
    },
    id: function() {
        return [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1];
    },
    print: function(a) {
        console.log(a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15]);
    },
    translate: function(a) {
        return [1, 0, 0, a[0],
            0, 1, 0, a[1],
            0, 0, 1, a[2],
            0, 0, 0, 1];
    },
    scale: function(a) {
        return [a[0], 0, 0, 0,
            0, a[1], 0, 0,
            0, 0, a[2], 0,
            0, 0, 0, 1];
    },
    transpose: function(a) {
        return [a[0], a[4], a[8], a[12],
        a[1], a[5], a[9], a[13],
        a[2], a[6], a[10], a[14],
        a[3], a[7], a[11], a[15]];
    },
    rotateZ: function(angle) {
        return [Math.cos(angle), -Math.sin(angle), 0, 0,
        Math.sin(angle), Math.cos(angle), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1];
    },
    rotateY: function(angle) {
        return [Math.cos(angle), 0, Math.sin(angle), 0,
            0, 1, 0, 0,
        -Math.sin(angle), 0, Math.cos(angle), 0,
            0, 0, 0, 1];
    },
    rotateX: function(angle) {
        return [1, 0, 0, 0,
            0, Math.cos(angle), -Math.sin(angle), 0,
            0, Math.sin(angle), Math.cos(angle), 0,
            0, 0, 0, 1];
    },
    coords: function(a, b, c) {
        return [a[0], b[0], c[0], 0,
        a[1], b[1], c[1], 0,
        a[2], b[2], c[2], 0,
            0, 0, 0, 1]
    },
    orthoCoordsYZ: function(b, c) {
        var c2 = vec3.normalize(c);
        var a2 = vec3.normalize((vec3.cross(b, c)));

        return this.coords(a2, b2, c2);
    },
    multiplyByVec3: function(a, b) {
        var a00 = a[0];
        var a10 = a[1];
        var a20 = a[2];
        var a01 = a[4];
        var a11 = a[5];
        var a21 = a[6];
        var a02 = a[8];
        var a12 = a[9];
        var a22 = a[10];

        return [a00 * b[0] + a10 * b[1] + a20 * b[2], a01 * b[0] + a11 * b[1] + a21 * b[2], a02 * b[0] + a12 * b[1] + a22 * b[2]];
    },
    multiplyByPoint3: function(a, b) {
        var a00 = a[0];
        var a10 = a[1];
        var a20 = a[2];
        var a30 = a[3];
        var a01 = a[4];
        var a11 = a[5];
        var a21 = a[6];
        var a31 = a[7];
        var a02 = a[8];
        var a12 = a[9];
        var a22 = a[10];
        var a32 = a[11];

        return [a00 * b[0] + a10 * b[1] + a20 * b[2] + a30, a01 * b[0] + a11 * b[1] + a21 * b[2] + a31, a02 * b[0] + a12 * b[1] + a22 * b[2] + a32];
    },
    multiplyByVec4: function(a, b) {
        var a00 = a[0];
        var a10 = a[1];
        var a20 = a[2];
        var a30 = a[3];
        var a01 = a[4];
        var a11 = a[5];
        var a21 = a[6];
        var a31 = a[7];
        var a02 = a[8];
        var a12 = a[9];
        var a22 = a[10];
        var a32 = a[11];
        var a03 = a[12];
        var a13 = a[13];
        var a23 = a[14];
        var a33 = a[15];

        return [a00 * b[0] + a10 * b[1] + a20 * b[2] + a30 * b[3],
        a01 * b[0] + a11 * b[1] + a21 * b[2] + a31 * b[3],
        a02 * b[0] + a12 * b[1] + a22 * b[2] + a32 * b[3],
        a03 * b[0] + a13 * b[1] + a23 * b[2] + a33 * b[3]];
    },
    multiply: function(a, b) {
        var a00 = a[0];
        var a10 = a[1];
        var a20 = a[2];
        var a30 = a[3];
        var a01 = a[4];
        var a11 = a[5];
        var a21 = a[6];
        var a31 = a[7];
        var a02 = a[8];
        var a12 = a[9];
        var a22 = a[10];
        var a32 = a[11];
        var a03 = a[12];
        var a13 = a[13];
        var a23 = a[14];
        var a33 = a[15];

        var b00 = b[0];
        var b10 = b[1];
        var b20 = b[2];
        var b30 = b[3];
        var b01 = b[4];
        var b11 = b[5];
        var b21 = b[6];
        var b31 = b[7];
        var b02 = b[8];
        var b12 = b[9];
        var b22 = b[10];
        var b32 = b[11];
        var b03 = b[12];
        var b13 = b[13];
        var b23 = b[14];
        var b33 = b[15];


        return [
            a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03,
            a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13,
            a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23,
            a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33,

            a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03,
            a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13,
            a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23,
            a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33,

            a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03,
            a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13,
            a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23,
            a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33,

            a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03,
            a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13,
            a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23,
            a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33

        ]
    },
    perspective: function(aspect, thfovy, min, max) {
        return [1.0 / (aspect * thfovy), 0, 0, 0,
            0, 1.0 / thfovy, 0, 0,
            0, 0, (max) / (min - max), min * max / (min - max),
            0, 0, -1.0, 0];
    },
    ortho: function(minx, maxx, miny, maxy, minz, maxz) {
        return [2.0 / (maxx - minx), 0, 0, (maxx + minx) / (maxx - minx),
            0, 2.0 / (maxy - miny), 0, (maxy + miny) / (maxy - miny),
            0, 0, -1.0 / (maxz - minz), -minz / (maxz - minz),
            0, 0, 0, 1];
    },

    //assumes m encodes a rigid transform
    rigid_inverse: function(m) {
        //hardcode mul
        let rot = mat4.create(
            m[0], m[4], m[8], 0,
            m[1], m[5], m[9], 0,
            m[2], m[6], m[10], 0,
            0, 0, 0, 1
        );
        let old_t = vec3.create(m[3], m[7], m[11]);

        let t = mat4.multiplyByPoint3(rot, vec3.symmetric(old_t));
        rot[3] = t[0];
        rot[7] = t[1];
        rot[11] = t[2];
        return rot;
    },



    orthoInv: function(minx, maxx, miny, maxy, minz, maxz) {
        return [(maxx - minx) / 2.0, 0, (maxx + minx) / 2.0,
            0, (maxy - miny) / 2.0, 0, (maxy + miny) / 2.0,
            0, 0, (maxz - minz) / -1.0, -minz,
            0, 0, 0, 1];
    },
    /*z = (z*a + b)/-z   */
    /* (-max*a + b)/(max) = 1
     * (-min*a + b)/(max) = 0
     * b = min*a
     * a=(max)/(min-max)
     * */
    perspectiveInv: function(aspect, thfovy, min, max) {
        //gets a,b,c,1, returns point in space
        let f = (max - min);

        return [
            aspect * thfovy, 0, 0, 0,
            0, thfovy, 0, 0,
            0, 0, 0, -1,
            0, 0, (min - max) / (max * min), 1.0 / min

        ]

    }



};


var quaternion = {
    getMatrix: function(q1) {
        let q = q1;
        return mat4.create(
            1. - 2. * (q[2] * q[2] + q[3] * q[3]), 2. * (q[1] * q[2] - q[3] * q[0]), 2 * (q[1] * q[3] + q[2] * q[0]), 0,
            2. * (q[1] * q[2] + q[3] * q[0]), 1. - 2. * (q[1] * q[1] + q[3] * q[3]), 2. * (q[2] * q[3] - q[1] * q[0]), 0,
            2. * (q[1] * q[3] - q[2] * q[0]), 2. * (q[2] * q[3] + q[1] * q[0]), 1. - 2. * (q[1] * q[1] + q[2] * q[2]), 0,
            0, 0, 0, 1.0);

    },
    conjugate: function(q) {

        return this.create(q[0], -q[1], -q[2], -q[3]);
    },
    identity: function() {
        return [1, 0, 0, 0];
    },
    create: function(a, b, c, d) {
        return [a, b, c, d];
    },
    applyV: function(q1, a) {
        let q2 = quaternion.create(1, a[0], a[1], a[2]);
        let q3 = quaternion.conjugate(q1);
        q = quaternion.multiply(q1, quaternion.multiply(q2, q3));
        return vec3.create(q[1], q[2], q[3])
    },

    rotationX: function(theta) {
        let a = Math.cos(theta * 0.5);
        let b = Math.sin(theta * 0.5);
        return this.normalize([a, b, 0, 0]);
    },
    rotationY: function(theta) {
        let a = Math.cos(theta * 0.5);
        let b = Math.sin(theta * 0.5);
        return this.normalize([a, 0, b, 0]);
    },
    rotationZ: function(theta) {
        let a = Math.cos(theta * 0.5);
        let b = Math.sin(theta * 0.5);
        return this.normalize([a, 0, 0, b]);
    },

    multiply: function(q1, q2) {
        return [
            q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2] - q1[3] * q2[3],
            q1[0] * q2[1] + q1[1] * q2[0] + q1[2] * q2[3] - q1[3] * q2[2],
            q1[0] * q2[2] + q1[2] * q2[0] + q1[3] * q2[1] - q1[1] * q2[3],
            q1[0] * q2[3] + q1[3] * q2[0] + q1[1] * q2[2] - q1[2] * q2[1]
        ]
    },

    multiplyByScalar: function(q1, s) {
        return [q1[0] * s, q1[1] * s, q1[2] * s, q1[3] * s];
    },
    dot: function(q1, q2) {
        return q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3];
    },
    normalize: function(q) {
        let l = this.len(q);
        if (l < 0.001)
            return this.create(1, 0, 0, 0);

        return this.multiplyByScalar(q, 1.0 / l);
    },
    lenSqr: function(q) {
        return this.dot(q, q);
    },
    len: function(q) {
        return Math.sqrt(this.lenSqr(q));
    },
    inverse: function(q) {
        let f = 1. / this.lenSqr(q);
        return [q[0] * f, -q[1] * f, -q[2] * f, -q[3] * f];
    },
    qlerp: function(q1, q2, t) {
        let cosTheta = this.dot(q1, q2);
        if (abs(cosTheta) > 0.95) {
            //lerp
            return this.normalize(this.add(this.multiplyByScalar(q1, 1.0 - t), this.multiplyByScalar(q2, t)));
        }

        let theta = Math.acos(cosTheta);
        return this.normalize(this.multiplyByScalar(
            this.add(this.multiplyByScalar(q1, Math.sin((1 - t) * theta))),
            this.multiplyByScalar(q2, Math.sin(t * theta))),
            1.0 / Math.sin(theta));
    }
};

//quaternions are a+bi+cj+dk
//transforms are TRx (i.e.: rotation followed by translation)
var transform = {
    identity: function() {
        return {
            rot: quaternion.create(1, 0, 0, 0),
            translation: vec3.create(0, 0, 0)
        }
    },
    create: function(q, t) {
        return {
            rot: q,
            translation: t
        }
    },

    getMatrix: function(a) {
        return mat4.multiply(mat4.translate(a.translation), quaternion.getMatrix(a.rot))
    },
    inverse: function(a) {
        return transform.create(quaternion.conjugate(a.rot),
            quaternion.applyV(quaternion.conjugate(a.rot), vec3.symmetric(a.translation)))
    },

    inverseM: function(a) {
        return mat4.multiply(quaternion.getMatrix(quaternion.inverse(a.rot)), mat4.translate(vec3.symmetric(a.translation)))
    },


    //apply a after b
    compose: function(a, b) {
        return transform.create(quaternion.normalize(quaternion.multiply(a.rot, b.rot)),
            vec3.add(a.translation, quaternion.applyV(a.rot, b.translation)));
    }
}


/*
ortho: function(aspect, scale, min, max) {

        return [1.0 / (aspect * scale), 0, 1, 0,
            0, 1.0 / scale, 0, 0,
            0, 0, 1.0 / (max - min), -min / (max - min),
            0, 0, 0, 1
        ]
    },
*/
