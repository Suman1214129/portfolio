document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("profile-canvas-container");
    if (!container) return;

    const img = document.getElementById("profile-img");
    const canvas = document.getElementById("particle-canvas");
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    let particles = [];
    let mouse = { x: -1000, y: -1000, radius: 60 };
    let isHovering = false;

    function init() {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        
        try {
            // draw image covering the canvas
            // we'll use object-fit cover logic essentially
            let scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            let x = (canvas.width / 2) - (img.width / 2) * scale;
            let y = (canvas.height / 2) - (img.height / 2) * scale;
            tempCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
            
            const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            const cellSize = 3; 

            particles = [];
            for (let y = 0; y < canvas.height; y += cellSize) {
                for (let x = 0; x < canvas.width; x += cellSize) {
                    const index = (y * canvas.width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    const a = data[index + 3];

                    if (a > 0) { 
                        if (Math.random() > 0.4) { // dropoutStrength
                            particles.push({
                                x: x,
                                y: y,
                                originX: x,
                                originY: y,
                                color: `rgba(${r},${g},${b},${a/255})`,
                                vx: 0,
                                vy: 0,
                                size: cellSize * 0.9
                            });
                        }
                    }
                }
            }
        // Success! Hide the original image and show the canvas.
        img.style.opacity = "0"; // hide but keep dimensions if needed
        canvas.style.display = "block";
        canvas.style.pointerEvents = "auto";
        
        animate();
    } catch (e) {
        console.error("Particle canvas failed to init, likely due to local CORS:", e);
        // Fallback to static image is already handled by CSS
    }
}

    if (img.complete) {
        init();
    } else {
        img.addEventListener("load", init);
    }

    container.addEventListener("mousemove", (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        isHovering = true;
    });

    container.addEventListener("mouseleave", () => {
        isHovering = false;
        mouse.x = -1000;
        mouse.y = -1000;
    });

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];

            if (isHovering) {
                let dx = mouse.x - p.x;
                let dy = mouse.y - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    // Jitter & Scatter
                    let jitter = (Math.random() - 0.5) * 4; 
                    p.vx -= forceDirectionX * force * 5 + jitter;
                    p.vy -= forceDirectionY * force * 5 + jitter;
                }
            }

            // Spring back
            p.vx += (p.originX - p.x) * 0.08;
            p.vy += (p.originY - p.y) * 0.08;

            // Friction
            p.vx *= 0.82;
            p.vy *= 0.82;

            p.x += p.vx;
            p.y += p.vy;

            ctx.fillStyle = p.color;
            ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        }
    }
});
