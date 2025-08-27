// WebGL Shader Background - Dev Square Demo
class ShaderBackground {
    constructor(container) {
        if (!container) {
            console.error('ShaderBackground: Container element is required');
            return;
        }
        
        this.container = container;
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.animationId = null;
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        try {
            // Create fullscreen canvas for background
            this.canvas = document.createElement('canvas');
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.zIndex = '-10';
            this.canvas.style.pointerEvents = 'none';
            
            // Set canvas resolution to match viewport
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            // Add a subtle label in corner
            const label = document.createElement('div');
            label.textContent = 'WebGL Background';
            label.style.position = 'fixed';
            label.style.bottom = '20px';
            label.style.right = '20px';
            label.style.color = '#ff00ff';
            label.style.fontFamily = 'Comic Sans MS, cursive';
            label.style.fontSize = '12px';
            label.style.fontWeight = 'bold';
            label.style.textShadow = '1px 1px 0 #000';
            label.style.zIndex = '-9';
            label.style.opacity = '0.6';
            label.style.pointerEvents = 'none';
            
            // Make sure the container has relative positioning
            if (getComputedStyle(this.container).position === 'static') {
                this.container.style.position = 'relative';
            }
            
            // Add to body instead of container for fullscreen effect
            document.body.appendChild(label);
            document.body.appendChild(this.canvas);
            
            // Handle window resize
            window.addEventListener('resize', () => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                if (this.gl) {
                    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                }
            });
            
            // Get WebGL context
            this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
            
            if (!this.gl) {
                console.warn('WebGL not supported, showing fallback');
                this.fallbackBackground();
                return;
            }
            
            this.setupWebGL();
            this.animate();
            
        } catch (error) {
            console.error('ShaderBackground: Error during initialization:', error);
            this.fallbackBackground();
        }
    }
    
    fallbackBackground() {
        if (this.canvas) {
            // Simple CSS animated background as fallback for fullscreen
            this.canvas.style.background = `
                linear-gradient(45deg, 
                    rgba(255,0,255,0.1) 0%, rgba(0,255,255,0.1) 25%, 
                    rgba(255,255,0,0.1) 50%, rgba(0,255,0,0.1) 75%, 
                    rgba(255,0,255,0.1) 100%)
            `;
            this.canvas.style.backgroundSize = '400% 400%';
            this.canvas.style.animation = 'gradientShift 6s ease-in-out infinite';
        }
    }
    
    setupWebGL() {
        const gl = this.gl;
        
        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        // Fragment shader with animated circles
        const fragmentShaderSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;
            
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            float circle(vec2 uv, vec2 center, float radius) {
                float dist = distance(uv, center);
                return 1.0 - smoothstep(radius - 0.02, radius + 0.02, dist);
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                
                // Center the coordinates
                uv = uv - 0.5;
                
                // Adjust for aspect ratio
                uv.x *= u_resolution.x / u_resolution.y;
                
                // Rotate the camera (increased rotation)
                float angle = 0.6;  // Increased rotation angle (about 34 degrees)
                float cosAngle = cos(angle);
                float sinAngle = sin(angle);
                
                // Apply rotation matrix
                vec2 rotatedUv = vec2(
                    uv.x * cosAngle - uv.y * sinAngle,
                    uv.x * sinAngle + uv.y * cosAngle
                );
                
                // Moving thick band patterns (Earthbound style) - slower animation
                float time = u_time * 0.1;  // Much slower animation
                
                // Create thick horizontal bands without perspective
                float bandSpacing = 4.0;  // Much thicker bands (reduced from 8.0)
                float bandY = rotatedUv.y * bandSpacing + time * 1.5;
                
                // Use floor to create solid bands
                float bandIndex = floor(bandY);
                
                // Alternating colors: yellow and blue bands
                bool isYellow = mod(bandIndex, 2.0) < 1.0;
                
                vec3 yellowColor = vec3(1.0, 0.9, 0.0);    // Bright yellow
                vec3 blueColor = vec3(0.0, 0.3, 1.0);      // Deep blue
                vec3 color = isYellow ? yellowColor : blueColor;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        // Create and compile shaders
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        if (!vertexShader || !fragmentShader) {
            this.fallbackBackground();
            return;
        }
        
        // Create program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('WebGL program linking failed:', gl.getProgramInfoLog(this.program));
            this.fallbackBackground();
            return;
        }
        
        // Set up vertices for full-screen quad
        const vertices = new Float32Array([
            -1, -1,  1, -1,  -1, 1,  1, 1
        ]);
        
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        // Get locations
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
            console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    animate() {
        if (!this.gl || !this.program) return;
        
        const gl = this.gl;
        const time = (Date.now() - this.startTime) / 1000.0;
        
        gl.clearColor(0.1, 0.1, 0.2, 1.0);
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

// Initialize the demo square
function initShaderDemo() {
    // Find the games page container
    const container = document.querySelector('.general-container') || 
                     document.querySelector('.content') || 
                     document.querySelector('body');
    
    if (container) {
        console.log('Creating WebGL demo square');
        new ShaderBackground(container);
    }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShaderDemo);
} else {
    initShaderDemo();
}

// Add CSS for fallback animation
const style = document.createElement('style');
style.textContent = `
    @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
`;
document.head.appendChild(style);
