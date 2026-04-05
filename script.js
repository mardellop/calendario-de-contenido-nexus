const demoPosts = [
    { id: 1, day: 1, title: 'PRESENTACIÓN DE NEXUS SEAMLESSSS', platform: 'instagram', time: '10:00', notes: 'Uso de hashtags premium.' },
    { id: 2, day: 2, title: 'NEXUS: EL FUTURO SE ENROLLA', platform: 'youtube', time: '18:00', notes: 'Link en bio.' },
    { id: 3, day: 0, title: 'Post Informativo Grapheno', platform: 'linkedin', time: '15:00', notes: 'Tone of voice profesional.' },
    { id: 4, day: 4, title: 'Filosofía Nexus: El Enlace Invisible', platform: 'linkedin', time: '12:00', notes: 'Comunicación emocional.' },
    { id: 5, day: 3, title: 'FUERA ÁNGULOS RECTOS', platform: 'instagram', time: '15:00', notes: 'Muestra de versatilidad.' },
    { id: 6, day: 5, title: 'DISPOSITIVO POR DENTRO', platform: 'instagram', type: 'story', time: '08:00', notes: 'Contenido rápido.' },
    { id: 7, day: 6, title: 'EL MINIMALISMO NECESARIO', platform: 'instagram', type: 'post', time: '20:00', notes: 'Cierre de semana.' }
];

let posts = JSON.parse(localStorage.getItem('socialPosts')) || demoPosts;

// Force sync: If demo posts are missing (due to old localStorage), add them back
if (posts.length < 7 || !posts.find(p => p.id === 7)) {
    posts = demoPosts;
    localStorage.setItem('socialPosts', JSON.stringify(posts));
}

const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const calendarGrid = document.getElementById('calendarGrid');
const modal = document.getElementById('postModal');
const postForm = document.getElementById('postForm');
const platformOptions = document.querySelectorAll('.platform-opt');
const selectedPlatformInput = document.getElementById('selectedPlatform');

// Initialize
function init() {
    renderCalendar();
    setupEventListeners();
    updateDateRange();
}

function renderCalendar() {
    calendarGrid.innerHTML = '';
    
    // Get current week start (Monday)
    const monday = new Date(2026, 3, 20); // 20 de Abril de 2026 (Month is 0-indexed, so 3 is April)

    const defaultPlatforms = ['linkedin', 'instagram', 'youtube', 'instagram', 'linkedin', 'instagram', 'instagram'];
    const logoMap = {
        instagram: 'Instagram_logo.png',
        linkedin: 'LinkedIn_logo.png',
        youtube: 'Youtube_logo.png',
        tiktok: 'Tiktok_logo.png' // Adjust if this file exists later
    };

    dayNames.forEach((name, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        
        const isToday = date.toDateString() === new Date().toDateString();
        const mainPlatform = defaultPlatforms[index];
        const logoSrc = logoMap[mainPlatform] || 'Instagram_logo.png';
        
        const dayCol = document.createElement('div');
        dayCol.className = `day-column ${isToday ? 'today' : ''}`;
        dayCol.dataset.day = index;
        
        dayCol.innerHTML = `
            <div class="day-header">
                <span class="day-name">${name}</span>
                <span class="day-date">${date.getDate()}</span>
            </div>
            <div class="platform-hero ${mainPlatform}" onclick="toggleDay(${index})">
                <img src="${logoSrc}" alt="${mainPlatform}">
            </div>
            <div class="day-content" ondrop="drop(event)" ondragover="allowDrop(event)">
            </div>
        `;
        
        calendarGrid.appendChild(dayCol);
        
        // Add existing posts for this day
        const dayContent = dayCol.querySelector('.day-content');
        const dayPosts = posts.filter(p => p.day === index);
        
        dayPosts.forEach(post => {
            const postEl = createPostElement(post);
            dayContent.appendChild(postEl);
        });
    });
    
    lucide.createIcons();
}

function createPostElement(post) {
    const div = document.createElement('div');
    div.className = `post-card ${post.platform}`;
    div.draggable = true;
    div.id = `post-${post.id}`;
    div.dataset.id = post.id;
    
    div.ondragstart = (e) => {
        e.dataTransfer.setData('postId', post.id);
        div.style.opacity = '0.5';
    };
    
    div.ondragend = () => {
        div.style.opacity = '1';
    };

    div.onclick = (e) => {
        if(e.target.closest('.delete-post')) return;
        if (post.platform === 'linkedin') {
            showLinkedInViewer(post.id);
        } else if (post.platform === 'instagram') {
            showInstagramViewer(post.id);
        } else if (post.platform === 'youtube') {
            showYouTubeViewer(post.id);
        } else {
            editPost(post.id);
        }
    };

    let displayTitle = post.title;
    if (post.platform === 'linkedin') {
        displayTitle = post.day === 4 ? 'EL FIN DE LA ERA DE LOS CABLES' : 'EL FIN DEL HARDWARE RÍGIDO';
    } else {
        displayTitle = displayTitle.replace(/^REELS:\s*/i, '');
        if (post.day === 5) displayTitle = 'EL DISPOSITIVO POR DENTRO';
        if (post.day === 6) displayTitle = 'EL MINIMALISMO NECESARIO';
    }

    div.innerHTML = `
        <div class="post-header">
            <div class="post-platform">
                <i data-lucide="${post.platform === 'tiktok' ? 'music-2' : post.platform}"></i>
            </div>
            <span class="post-time">${post.time}</span>
        </div>
        <div class="post-title">${displayTitle}</div>
        </div>
    `;
    
    return div;
}

// Modal logic
function openModal(dayIndex, postId = null) {
    document.getElementById('postDay').value = dayIndex;
    document.getElementById('postId').value = postId || '';
    
    if (postId) {
        const post = posts.find(p => p.id === postId);
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postTime').value = post.time;
        document.getElementById('postNotes').value = post.notes || '';
        document.getElementById('modalTitle').textContent = 'Editar Contenido';
        setActivePlatform(post.platform);
    } else {
        postForm.reset();
        document.getElementById('modalTitle').textContent = 'Nuevo Contenido';
        setActivePlatform('instagram'); // Default
    }
    
    modal.style.display = 'flex';
}

function showLinkedInViewer(id) {
    const post = posts.find(p => p.id === id);
    const viewer = document.getElementById('linkedinViewer');
    const content = viewer.querySelector('.linkedin-viewer-content .linkedin');
    
    const contentData = {
        3: {
            title: "EL FIN DEL HARDWARE RÍGIDO",
            body: `<p style="margin-bottom: 12px;">¿Seguimos diseñando nuestra vida en función de dónde está el enchufe o de cuánto pesa el maletín? La tecnología actual, por muy buena que sea, sigue siendo un ancla física. Cables, adaptadores y pantallas de cristal que crujen al plegarse.</p>
                   <p style="margin-bottom: 12px;">Es hora de pasar de "cargar con la oficina" a que la oficina aparezca donde tú estés.</p>
                   <p style="margin-bottom: 12px;">Presentamos <strong>NEXUS SEAMLESS (Gen 1):</strong> no es un portátil, es una lámina de inteligencia desplegable.</p>
                   <p style="margin-bottom: 12px;">Imagina un cilindro de titanio aeroespacial de solo 450 gramos. En su interior, una monocapa de grafeno de micras de espesor que se despliega para ofrecerte un espacio de trabajo táctil 8K. Sin puertos físicos. Sin bisagras que falle.</p>
                   <p style="margin-bottom: 12px;">Gracias a la tecnología gecko y su sistema magnético, puedes adherir tu pantalla a cualquier pared o superficie. Puedes trabajar de pie, sentado o tumbado; el entorno se adapta a ti, no al revés.</p>
                   <p style="margin-bottom: 12px;">Olvida el cargador. La carga por radio-inducción ambiental permite que el Nexus Seamless se alimente de las señales de radiofrecuencia del entorno. Autonomía total, incluso en aislamiento. Estamos ante la Trama Conductiva Unificada. Es el salto de la computación mecánica a la tecnología molecular. El futuro no se transporta en una mochila, se lleva en la palma de la mano.</p>
                   <p style="margin-bottom: 12px;">El futuro del trabajo no tiene cables, no tiene peso y, por fin, no tiene límites.</p>
                   <p style="margin-bottom: 12px;">Bienvenidos a la era de la tecnología que fluye.</p>`,
            media: "nexus-seamless-dispositivo.png",
            hashtags: "#NexusSeamless #Grafeno #FutureOfWork #DigitalNomad #Productividad #Innovacion #DeepTech #Sostenibilidad"
        },
        4: {
             title: "EL FIN DE LA ERA DE LOS CABLES",
            body: `<p style="margin-bottom: 12px;">Pasamos el día buscando enchufes como si fueran oasis, lidiando con bisagras que se quejan y cargando mochilas que parecen pesar más que nuestras propias ideas. Nos prometieron libertad, pero nos dieron anclas de plástico y metal que dictan nuestra postura.</p>
                   <p style="margin-bottom: 12px;">En NEXUS SEAMLESS hemos decidido romper ese contrato. No estamos aquí para venderte otro dispositivo que "hace cosas". Estamos aquí para disolver la barrera entre lo que piensas y lo que creas.</p>
                   <p style="margin-bottom: 12px;">¿Qué hace a NEXUS diferente?</p>
                   <p style="margin-bottom: 12px;">No es un bloque, es un flujo: Olvida los ángulos rígidos. Hemos sustituido la fragilidad mecánica por una lámina de grafeno y titanio. Un material que no se impone al espacio, sino que lo reclama.</p>
                   <p style="margin-bottom: 12px;">La dictadura de los cables ha terminado: Hemos tenido el valor de eliminar lo innecesario. Sin puertos que se ensucien, sin cables que se enreden. Solo ingeniería molecular expuesta con orgullo.</p>
                   <p style="margin-bottom: 12px;">Tu lienzo no tiene fronteras: Ya no "llevas la oficina a cuestas". Ahora, cualquier superficie (desde el cristal de una oficina en Singapur hasta la mesa de un café en Berlín) se convierte en un espacio de trabajo de 8K.</p>
                   <p style="margin-bottom: 12px;">No fabricamos herramientas para una temporada. Forjamos herramientas para una vida. Porque creemos que la tecnología no debería ser algo que usas, sino algo que fluye a tu alrededor.</p>
                   <p style="margin-bottom: 12px;">Es hora de dejar de adaptarnos a las máquinas. Es hora de que el hardware sea lo suficientemente valiente para moldearse a ti.</p>
                   <p style="margin-bottom: 12px;">¿Estás listo para dejar de buscar enchufes y empezar a buscar ideas?</p>
                   <p style="margin-bottom: 12px;">#NexusSeamless #FutureOfTech #HumanCentricDesign #Innovation #DeepTech #WorkFromAnywhere</p>`,
            media: "nexus-seamless-mochila.png",
            hashtags: "#NexusSeamless #TechRevolution #MinimalismoFuncional #FuturoDelTrabajo #Innovation #Grafeno #DiseñoSinLímites"
        }
    };

    const data = contentData[post.id] || contentData[3]; 
    
    content.innerHTML = `
        <div class="post-header" style="padding: 12px;">
            <div class="linkedin-avatar">
                <img src="nexus-logo.png" alt="Nexus">
            </div>
            <div class="linkedin-user-info">
                <span class="linkedin-name" style="font-size: 14px; font-weight: 600;">NEXUS SEAMLESS · </span>
                <span class="linkedin-tagline" style="font-size: 12px; color: #666;">El primer ordenador sin cables ni puertos físicos</span>
            </div>
        </div>
        <div class="linkedin-body" style="padding: 0 12px 12px 12px; font-size: 14px; text-align: left; color: rgba(0,0,0,0.9);">
            <p style="font-weight: 700; margin-bottom: 12px;">${data.title}</p>
            ${data.body}
            <p style="color: #0a66c2; font-size: 14px; margin-top: 15px;">${data.hashtags}</p>
        </div>
        <div class="linkedin-media">
            <img src="${data.media}" alt="Nexus Seamless Media" style="width: 100%;">
        </div>
        </div>
    `;
    
    lucide.createIcons();
    viewer.style.display = 'flex';
}

function showInstagramViewer(id) {
    const post = posts.find(p => p.id === id);
    const viewer = document.getElementById('linkedinViewer');
    viewer.classList.add('no-blur'); // Performance boost for video
    const content = viewer.querySelector('.linkedin-viewer-content .linkedin');
    viewer.querySelector('.modal-title').textContent = post.type === 'story' ? 'Story para Instagram' : 'Publicación para Instagram';
    viewer.querySelector('.modal').style.maxWidth = '400px'; 
    
    if (post.type === 'story') {
        content.innerHTML = `
            <div class="ig-story-container" style="position: relative; width: 100%; height: 80vh; background: #000; overflow: hidden; border-radius: 0.5rem;">
                <!-- Story Bars -->
                <div style="position: absolute; top: 10px; left: 10px; right: 10px; display: flex; gap: 4px; z-index: 20;">
                    <div style="flex: 1; height: 2px; background: #fff; border-radius: 2px;"></div>
                    <div style="flex: 1; height: 2px; background: rgba(255,255,255,0.4); border-radius: 2px;"></div>
                </div>
                <!-- Story User Info -->
                <div style="position: absolute; top: 25px; left: 10px; display: flex; align-items: center; gap: 8px; z-index: 20; color: #fff;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; border: 1px solid #fff;">
                        <img src="nexus-logo.png" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <span style="font-weight: 700; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">nexus_seamless</span>
                    <span style="font-size: 12px; opacity: 0.8;">2 h</span>
                </div>
                <!-- Story Media -->
                <img src="Story-nexus.png" style="width: 100%; height: 100%; object-fit: contain; background: #000;">
                <!-- Story Input -->
                <div style="position: absolute; bottom: 12px; left: 10px; right: 10px; display: flex; align-items: center; gap: 18px; z-index: 20;">
                    <div style="flex: 1; border: 1px solid rgba(255,255,255,0.4); border-radius: 30px; padding: 8px 15px; color: #fff; font-size: 13px;">Enviar mensaje</div>
                    <i data-lucide="heart" style="color: #fff; width: 22px; height: 22px; cursor: pointer;"></i>
                    <i data-lucide="message-circle" style="color: #fff; width: 22px; height: 22px; cursor: pointer;"></i>
                    <i data-lucide="send" style="color: #fff; width: 22px; height: 22px; cursor: pointer;"></i>
                </div>
            </div>
        `;
        lucide.createIcons();
        viewer.style.display = 'flex';
        return;
    }

    let mediaContent = '';
    if (post.id === 1) { // Video Reel
        mediaContent = `
            <video controls autoplay preload="auto" playsinline style="width: 100%; max-height: 60vh; object-fit: contain; display: block;">
                <source src="instagram-reels.mp4" type="video/mp4">
            </video>
        `;
    } else if (post.type === 'post') { // Static Image Post
        mediaContent = `
            <img src="post-estatico.png" style="width: 100%; height: auto; max-height: 55vh; object-fit: contain; background: #fff; display: block;">
        `;
    } else { // Carousel for other IG posts
        mediaContent = `
            <div class="ig-carousel-container" style="position: relative; width: 100%; overflow: hidden; background: #fff;">
                <div class="ig-carousel" 
                     onscroll="const dots = this.parentElement.parentElement.querySelectorAll('.ig-dot'); const idx = Math.round(this.scrollLeft / this.clientWidth); dots.forEach((d, i) => d.style.background = i === idx ? '#0095f6' : '#dbdbdb');"
                     style="width: 100%; max-height: 60vh; overflow-x: auto; display: flex; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none;">
                    <img src="post1-carrusel.png" style="min-width: 100%; scroll-snap-align: start; object-fit: cover; background: #fff;">
                    <img src="post2-carrusel.png" style="min-width: 100%; scroll-snap-align: start; object-fit: cover; background: #fff;">
                    <img src="post3-carrusel.jpg" style="min-width: 100%; scroll-snap-align: start; object-fit: cover; background: #fff;">
                </div>
                <!-- Navigation Arrows -->
                <button onclick="this.parentElement.querySelector('.ig-carousel').scrollBy({left: -400, behavior: 'smooth'})" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.7); border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; font-weight: bold;">‹</button>
                <button onclick="this.parentElement.querySelector('.ig-carousel').scrollBy({left: 400, behavior: 'smooth'})" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.7); border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; font-weight: bold;">›</button>
                
                <!-- Pagination Dots correctly positioned as overlay -->
                <div style="position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: center; gap: 4px; pointer-events: none;">
                    <div class="ig-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #0095f6; transition: background 0.3s;"></div>
                    <div class="ig-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #dbdbdb; transition: background 0.3s;"></div>
                    <div class="ig-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #dbdbdb; transition: background 0.3s;"></div>
                </div>
            </div>
        `;
    }

    content.innerHTML = `
        <div class="ig-header" style="padding: 10px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #efefef;">
            <div style="width: 28px; height: 28px; border-radius: 50%; border: 2px solid #e1306c; padding: 2px;">
                <img src="nexus-logo.png" style="width: 100%; height: 100%; border-radius: 50%;">
            </div>
            <span style="font-weight: 700; font-size: 13px;">nexus_seamless</span>
        </div>
        <div class="ig-media" style="position: relative; background: #fff; overflow: hidden;">
            ${mediaContent}
        </div>
        <div class="ig-footer" style="padding: 10px; text-align: left; font-size: 13px;">
            <div style="display: flex; gap: 12px; margin-bottom: 8px; font-size: 20px;">
            </div>
            <div style="white-space: pre-line;">
                <span style="font-weight: 700;">nexus_seamless</span> 
                ${post.id === 5 ? 'El mundo no tiene ángulos rectos, y tú tampoco. Entonces, ¿por qué tu tecnología sí?\n\nDurante años, te has adaptado a pantallas que no rotan, cables que te atan a la pared y dispositivos que caducan antes que tus ideas. En NEXUS SEAMLESS, hemos sustituido el esfuerzo de doblar por la elegancia de enrollar.\n\nNo fabricamos hardware. Creamos libertad envuelta en titanio y grafeno.\n\n🔗https://mardellop.github.io/nexus-seamless/' : 
                  post.id === 7 ? 'El minimalismo no es la ausencia de algo, sino la presencia de lo esencial.\n\nNEXUS SEAMLESS redefine la relación con tus herramientas de trabajo. Hemos destilado la potencia de una estación de trabajo de alto rendimiento en un cilindro de titanio de solo 450 gramos.\n\n✨ Sin puertos físicos. Sin bisagras frágiles. Sin límites.\n\nImagina desplegar una pantalla de grafeno 8K en la pared de un café en Berlín o en la sala VIP de un aeropuerto.\n\nNEXUS no caduca. Está construido para durar, desafiando la obsolescencia programada.\n\n🔗Visita https://mardellop.github.io/nexus-seamless/ y haz que tu oficina quepa en tu mano.' :
                  '¿Y si tu oficina entera cupiera en la palma de tu mano? 🤯\n\nDespídete de las mochilas pesadas y los portátiles aparatosos. Con NEXUS SEAMLESS, llevas la potencia de un equipo de escritorio dentro de un cilindro de titanio.\n\nTrabaja donde quieras. Sin límites. Sin peso.\n\n13 de Mayo de 2026.\n\n🔗 Reserva tu Nexus Seamless en https://mardellop.github.io/nexus-seamless/ y sé de los primeros en experimentar el futuro.\n\n👇 ¿En qué lugar del mundo estrenarías tu Nexus Seamless? Déjalo en los comentarios.'}
            </div>
            <div style="color: #00376b; margin-top: 2px;">#NexusSeamless #Tecnologia #Innovacion #Productividad #NomadaDigital #Emprendedores</div>
        </div>
    `;
    
    viewer.style.display = 'flex';
}

function showYouTubeViewer(id) {
    const viewer = document.getElementById('linkedinViewer');
    viewer.classList.add('no-blur'); // Massive performance boost for 350MB 4K video
    const content = viewer.querySelector('.linkedin-viewer-content .linkedin');
    viewer.querySelector('.modal-title').textContent = 'Vídeo para YouTube';
    viewer.querySelector('.modal').style.maxWidth = '900px'; 
    
    content.innerHTML = `
        <div class="yt-media" style="background: #000; border-radius: 0.5rem 0.5rem 0 0; overflow: hidden; will-change: transform;">
    <iframe 
        src="https://drive.google.com/file/d/1wxwLm4tmTq55243WNHHAuCM0OAdjRaoh/preview" 
        width="640" 
        height="360" 
        allow="autoplay; encrypted-media" 
        allowfullscreen>
    </iframe>
        </div>
        <div class="yt-info" style="padding: 1.5rem; text-align: left; background: #fff;">
            <h1 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">NEXUS SEAMLESS: EL FIN DE LOS LÍMITES. EL FUTURO SE ENROLLA</h1>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden;">
                        <img src="nexus-logo.png" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 1rem;">NEXUS SEAMLESS</div>
                        <div style="font-size: 0.8rem; color: #666;">2.4M suscriptores</div>
                    </div>
                    <button style="background: #000; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 2rem; font-weight: 600; margin-left: 1rem; cursor: pointer;">Suscribirse</button>
                </div>
            </div>
            <div style="background: #f2f2f2; padding: 0.75rem; border-radius: 0.75rem; font-size: 0.9rem; line-height: 1.5; white-space: pre-line;">
                ¿Estás listo para dejar atrás las ataduras? La tecnología nos prometió libertad, pero terminamos encadenados a maletines pesados, cables enredados y la constante ansiedad de una batería agotándose. El mundo es tu oficina, pero solo si tu equipo te permite llegar a donde quieras.\n\nHoy, las reglas cambian para siempre. Presentamos el Nexus Seamless, el primer ordenador del mundo diseñado para ser verdaderamente libre.

Lo que hace al Nexus Seamless único:
Pantalla de grafeno monocapa: Más resistente que el acero y tan flexible que se enrolla sobre sí misma. Di adiós a las bisagras frágiles y las pantallas rotas.

Cero puertos físicos: Una experiencia totalmente inalámbrica y sin complicaciones.

Potencia sin compromisos: Todo el rendimiento de un ordenador de sobremesa en un formato cilíndrico revolucionario que cabe en la palma de tu mano.

NexusOS Core: Un sistema operativo fluido, intuitivo y diseñado para que tus ideas fluyan sin distracciones.

La verdadera movilidad no es llevar tu oficina a cuestas, es eliminar la fricción entre tú y tu trabajo.

📅 MARCA TU CALENDARIO: 13 DE MAYO DE 2026.
No te quedes fuera de la revolución.

#NexusSeamless #NexusOS #FuturoTecnologico #Innovacion #GrapheneScreen #TechLaunch2026
            </div>
        </div>
    `;
    viewer.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
    const viewer = document.getElementById('linkedinViewer');
    viewer.style.display = 'none';
    viewer.classList.remove('no-blur'); // Restore blur for other modals
    
    // Stop all videos when closing
    const videos = viewer.querySelectorAll('video');
    videos.forEach(video => video.pause()); 

    // Restore viewer defaults
    viewer.querySelector('.modal-title').textContent = 'Publicación para LinkedIn';
    viewer.querySelector('.modal').style.maxWidth = '650px';
}

function setActivePlatform(platform) {
    platformOptions.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.platform === platform);
    });
    selectedPlatformInput.value = platform;
}

window.toggleDay = function(dayIndex) {
    const cols = document.querySelectorAll('.day-column');
    cols[dayIndex].classList.toggle('active');
};

// Drag and Drop
window.allowDrop = function(ev) {
    ev.preventDefault();
};

window.drop = function(ev) {
    ev.preventDefault();
    const postId = parseInt(ev.dataTransfer.getData('postId'));
    const targetDay = parseInt(ev.currentTarget.parentElement.dataset.day);
    
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1 && posts[postIndex].day !== targetDay) {
        posts[postIndex].day = targetDay;
        saveData();
        renderCalendar();
    }
};

// Actions
function deletePost(id) {
    if(confirm('¿Eliminar este post?')) {
        posts = posts.filter(p => p.id !== id);
        saveData();
        renderCalendar();
    }
}

function editPost(id) {
    const post = posts.find(p => p.id === id);
    openModal(post.day, id);
}

function saveData() {
    localStorage.setItem('socialPosts', JSON.stringify(posts));
}

function setupEventListeners() {
    // Platform selection
    platformOptions.forEach(opt => {
        opt.onclick = () => setActivePlatform(opt.dataset.platform);
    });

    // Form submission
    postForm.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('postId').value;
        const day = parseInt(document.getElementById('postDay').value);
        
        const postData = {
            id: id ? parseInt(id) : Date.now(),
            day,
            title: document.getElementById('postTitle').value,
            platform: selectedPlatformInput.value,
            time: document.getElementById('postTime').value,
            notes: document.getElementById('postNotes').value
        };

        if (id) {
            const index = posts.findIndex(p => p.id === parseInt(id));
            posts[index] = postData;
        } else {
            posts.push(postData);
        }

        saveData();
        closeModal();
        renderCalendar();
    };

    // Close buttons
    document.getElementById('closeModal').onclick = closeModal;
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('closeViewer').onclick = closeModal;
    window.onclick = (e) => { if (e.target === modal || e.target === document.getElementById('linkedinViewer')) closeModal(); };

    // Global New Post
    document.getElementById('newPostGlobal').onclick = () => openModal(0);
}

function updateDateRange() {
    document.getElementById('currentWeekRange').textContent = '20 Abr - 26 Abr';
}

// Initial Run
init();
