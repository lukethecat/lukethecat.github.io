const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.id = 'fluid-bg';

const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported');
    canvas.style.display = 'none';
}

// Vertex Shader: Simple pass-through
const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
        gl_Position = aVertexPosition;
    }
`;

// Fragment Shader: The "HDR" Fluid Effect
// Uses glowing orbs moving in a dark void to create deep, rich gradients
const fsSource = `
    precision highp float;
    uniform vec2 uResolution;
    uniform float uTime;

    // Pseudo-random
    float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

    // Noise function for subtle texture
    float noise(vec2 x) {
        vec2 i = floor(x);
        vec2 f = fract(x);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        // Correct aspect ratio
        uv.x *= uResolution.x / uResolution.y;

        float t = uTime * 0.2; // Slow animation speed

        // Deep Background Color (Zed Dark / Midnight Blue)
        vec3 color = vec3(0.05, 0.05, 0.08);

        // Moving glowing orbs (The "HDR" lights)
        // Orb 1: Cyan/Blue
        vec2 pos1 = vec2(
            0.5 + 0.4 * sin(t * 0.8),
            0.5 + 0.3 * cos(t * 0.9)
        );
        pos1.x *= uResolution.x / uResolution.y; // Aspect fix for position
        float dist1 = length(uv - pos1);
        float glow1 = 0.6 / (0.1 + dist1 * 2.0); // HDR Falloff
        color += vec3(0.0, 0.4, 0.8) * glow1 * 0.4;

        // Orb 2: Purple/Pink
        vec2 pos2 = vec2(
            0.8 + 0.4 * sin(t * 0.5 + 2.0),
            0.3 + 0.4 * cos(t * 0.6 + 1.0)
        );
        pos2.x *= uResolution.x / uResolution.y;
        float dist2 = length(uv - pos2);
        float glow2 = 0.5 / (0.1 + dist2 * 2.5);
        color += vec3(0.4, 0.0, 0.6) * glow2 * 0.35;

        // Orb 3: Subtle Teal (Mouse follower influence could go here, for now auto)
        vec2 pos3 = vec2(
            0.3 + 0.5 * cos(t * 0.7 + 4.0),
            0.7 + 0.3 * sin(t * 0.4 + 2.0)
        );
        pos3.x *= uResolution.x / uResolution.y;
        float dist3 = length(uv - pos3);
        float glow3 = 0.4 / (0.1 + dist3 * 3.0);
        color += vec3(0.0, 0.5, 0.5) * glow3 * 0.3;

        // Add subtle noise for "film grain" / texture
        float n = noise(uv * 800.0 + uTime * 10.0);
        color += vec3(n * 0.02);

        // Tone mapping ( Reinhard-ish ) to prevent blowout but keep HDR feel
        color = color / (1.0 + color);

        // Output
        gl_FragColor = vec4(color, 1.0);
    }
`;

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
        time: gl.getUniformLocation(shaderProgram, 'uTime'),
    },
};

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [
    -1.0,  1.0,
     1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

function render(now) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programInfo.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
    gl.uniform1f(programInfo.uniformLocations.time, now * 0.001);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
