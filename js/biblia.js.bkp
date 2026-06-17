let bibliaData = null;

document.addEventListener("DOMContentLoaded", () => {
    inicializarLectorNVI();
});

async function inicializarLectorNVI() {
    const selLibro = document.getElementById("selLibro");
    const selCapitulo = document.getElementById("selCapitulo");
    const btnLeer = document.getElementById("btnLeer");
    const areaTexto = document.getElementById("areaTexto");

    try {
        const respuesta = await fetch("./NVI.json");
        if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
        
        bibliaData = await respuesta.json();
        selLibro.innerHTML = '<option value="">-- Seleccione un Libro --</option>';
        
        bibliaData.books.forEach((libro, indice) => {
            const option = document.createElement("option");
            option.value = indice;
            option.textContent = libro.name;
            selLibro.appendChild(option);
        });

        selLibro.addEventListener("change", (e) => {
            actualizarCapitulos(e.target.value);
        });

        btnLeer.addEventListener("click", () => {
            renderizarCapitulo(selLibro.value, selCapitulo.value);
        });

    } catch (error) {
        console.error("[ERROR BIBLE FETCH]", error);
        areaTexto.innerHTML = `<p style="color: #c0392b; font-weight: bold; text-align: center;">⚠️ Error al cargar el lector de la Biblia local (NVI.json no encontrado o corrupto).</p>`;
    }
}

function actualizarCapitulos(indiceLibro) {
    const selCapitulo = document.getElementById("selCapitulo");
    selCapitulo.innerHTML = '<option value="">--</option>';

    if (indiceLibro === "") return;

    const libro = bibliaData.books[indiceLibro];
    const capitulos = libro.chapters || [];

    selCapitulo.innerHTML = '<option value="">Seleccione --</option>';
    capitulos.forEach((capitulo, indice) => {
        const option = document.createElement("option");
        option.value = indice;
        const numCapitulo = (capitulo.current && capitulo.current.chapter) ? capitulo.current.chapter : (indice + 1);
        option.textContent = `Capítulo ${numCapitulo}`;
        selCapitulo.appendChild(option);
    });
}

function renderizarCapitulo(indiceLibro, indiceCapitulo) {
    const areaTexto = document.getElementById("areaTexto");

    if (indiceLibro === "" || indiceCapitulo === "") {
        areaTexto.innerHTML = '<p class="texto-inicio" style="color: #e67e22;">Por favor, seleccione un libro y un capítulo válido.</p>';
        return;
    }

    const libro = bibliaData.books[indiceLibro];
    const capitulo = libro.chapters[indiceCapitulo];
    const items = capitulo.items || [];
    const tituloCapitulo = (capitulo.current && capitulo.current.human) ? capitulo.current.human : `${libro.name} ${parseInt(indiceCapitulo) + 1}`;
    
    let htmlResultado = `<h2 style="font-family: 'Lora', Georgia, serif; color: #2c3e50; font-size: 1.6rem; border-bottom: 1px solid #f0f0f0; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">${tituloCapitulo}</h2>`;
    htmlResultado += `<div class="capitulo-bloque-texto" style="font-family: 'Lora', Georgia, serif; font-size: 1.15rem; line-height: 1.9; color: #2c3e50; text-align: justify;">`;

    items.forEach(item => {
        if (item.type === "verse" && item.verse_numbers) {
            const numeroVersiculo = item.verse_numbers[0];
            const lineasTexto = item.lines ? item.lines.join(" ").trim() : "";
            if (lineasTexto) {
                htmlResultado += `<span class="v-num" style="font-size: 0.75rem; font-weight: bold; color: #3498db; vertical-align: super; margin-right: 0.25rem; margin-left: 0.4rem;">${numeroVersiculo}</span>${lineasTexto} `;
            }
        }
    });

    htmlResultado += `</div>`;
    areaTexto.innerHTML = htmlResultado;
    areaTexto.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
