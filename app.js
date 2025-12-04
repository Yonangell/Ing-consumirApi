document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "https://pokeapi.co/api/v2/pokemon";

  const container = document.getElementById("container-pokemon");
  const estado = document.getElementById("status-api");
  const btnAnterior = document.getElementById("btn-anterior");
  const btnSiguiente = document.getElementById("btn-siguiente");

  let proximoUrl = null;
  let antesUrl = null;

  function mostrandoEstado(mensaje, esError = false) {
    estado.textContent = mensaje;
    estado.className = `text-center p-4 mb-4 text-lg ${
      esError ? "bg-red-200 text-red-800" : "bg-blue-200 text-blue-800"
    }`;
  }

  function setCargando() {
    container.innerHTML = "";
    mostrandoEstado("Se esta cargando el pokemon...");
    btnAnterior.disabled = true;
    btnSiguiente.disabled = true;
  }

  function renderPokemon(pokemon) {
    const tarjeta = document.createElement("div");
    tarjeta.className =
      "bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300";

    const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const imageUrl =
      pokemon.sprites.front_default || "https://via.placeholder.com/250x150";

    tarjeta.innerHTML = `
            <img src="${imageUrl}" alt="${name}" class="mx-auto h-32 w-32 mb-4">
            <h2 class="text-xl font-semibold text-center">${name}</h2>
            <p class="text-gray-600 text-center">#${pokemon.id
              .toString()
              .padStart(3, "0")}</p>
            <div class="flex justify-center mt-2">
                ${pokemon.types
                  .map(
                    (typeInfo) => `
                    <span class="px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-800 mx-1">
                        ${typeInfo.type.name}
                    </span>
                `
                  )
                  .join("")}
            </div>
        `;
    container.appendChild(tarjeta);
  }

  async function fetchPokemones(url = API_BASE_URL) {
    setCargando();

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      proximoUrl = data.next;
      antesUrl = data.previous;
      btnAnterior.disabled = !antesUrl;
      btnSiguiente.disabled = !proximoUrl;

      estado.className = "hidden";
      container.innerHTML = "";

      const pokemonPromesa = data.results.map((pokemon) =>
        fetch(pokemon.url).then((res) => res.json())
      );
      const detallesPokemones = await Promise.all(pokemonPromesa);

      detallesPokemones.forEach(renderPokemon);
    } catch (error) {
      console.error("Hubo un problema con la operacion fetch:", error);
      mostrandoEstado(`Fallo la carga de datos ${error.message}`, true);

      btnAnterior.disabled = !antesUrl;
      btnSiguiente.disabled = !proximoUrl;
    }
  }

  btnSiguiente.addEventListener("click", () => {
    if (proximoUrl) {
      fetchPokemones(proximoUrl);
    }
  });

  btnAnterior.addEventListener("click", () => {
    if (antesUrl) {
      fetchPokemones(antesUrl);
    }
  });

  fetchPokemones();
});
