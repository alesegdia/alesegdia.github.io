// WebGL Header Shader Effect
class HeaderShader {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.animationId = null;
        this.startTime = Date.now();
        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
        this.container.prepend(this.canvas);
        window.addEventListener('resize', () => {
            this.canvas.width = this.container.offsetWidth;
            this.canvas.height = this.container.offsetHeight;
            if (this.gl) {
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
        });
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) return;
        this.setupWebGL();
        this.animate();
    }

    setupWebGL() {
        const gl = this.gl;
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        const fragmentShaderSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;
            // Arrow pointing right
            float arrow(vec2 uv, float thickness, float size) {
                float shaft = step(abs(uv.y), thickness);
                float head = step(abs(uv.y + uv.x * 0.5), thickness * 1.5) * step(-uv.x, size) * step(uv.x, 0.0);
                return max(shaft, head);
            }
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                uv = uv - 0.5;
                uv.y *= u_resolution.y / u_resolution.x;
                float angle = 0.6; // rotate to right
                float cosAngle = cos(angle);
                float sinAngle = sin(angle);
                vec2 rotatedUv = vec2(
                    uv.x * cosAngle - uv.y * sinAngle,
                    uv.x * sinAngle + uv.y * cosAngle
                );
                float time = u_time * 0.1;
                float bandSpacing = 4.0;
                float bandX = rotatedUv.x * bandSpacing - time * 1.5; // move to right
                float bandIndex = floor(bandX);
                int colorIdx = int(mod(bandIndex, 3.0));
                vec3 yellowColor = vec3(1.0, 0.9, 0.0);
                vec3 blueColor = vec3(0.0, 0.3, 1.0);
                vec3 redColor = vec3(1.0, 0.1, 0.1);
                vec3 color = colorIdx == 0 ? yellowColor : (colorIdx == 1 ? blueColor : redColor);
                float arrowPattern = arrow(rotatedUv, 0.07, 0.2);
                float band = step(abs(fract(bandX) - 0.5), 0.25);
                float alpha = max(band, arrowPattern * band);
                gl_FragColor = vec4(color, alpha);
            }
        `;
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vertexShader || !fragmentShader) return;
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) return;
        const vertices = new Float32Array([
            -1, -1,  1, -1,  -1, 1,  1, 1
        ]);
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
        this.timeLocation = gl.getUniformLocation(this.program, 'u_time');
        this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    animate() {
        if (!this.gl || !this.program) return;
        const gl = this.gl;
        const time = (Date.now() - this.startTime) / 1000.0;
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        gl.uniform1f(this.timeLocation, time);
        gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Attach header shader to .top-menu
window.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.top-menu');
    if (header) {
        new HeaderShader(header);
    }
});
