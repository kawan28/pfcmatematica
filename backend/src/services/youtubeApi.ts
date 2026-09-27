import "dotenv/config";

type VideoYoutube = {
  id: {
    videoId?: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
  };
};

type RespostaYoutube = {
  items?: VideoYoutube[];
};

export type MaterialReforco = {
  id: string;
  titulo: string;
  canal: string;
  link: string;
};

export async function buscarVideos(
  competencia: string
): Promise<MaterialReforco[]> {
  const chave = process.env.YOUTUBE_API_KEY;

  if (!chave) {
    throw new Error("Configure YOUTUBE_API_KEY no arquivo .env.");
  }

  const endereco = new URL(
    "https://www.googleapis.com/youtube/v3/search"
  );

  endereco.searchParams.set("key", chave);
  endereco.searchParams.set("part", "snippet");
  endereco.searchParams.set("type", "video");
  endereco.searchParams.set("maxResults", "3");
  endereco.searchParams.set("relevanceLanguage", "pt");
  endereco.searchParams.set("regionCode", "BR");
  endereco.searchParams.set("safeSearch", "strict");
  endereco.searchParams.set(
    "q",
    "matemática aula " + competencia
  );

  const controle = new AbortController();

  const tempoLimite = setTimeout(() => {
    controle.abort();
  }, 10000);

  try {
    const resposta = await fetch(endereco, {
      signal: controle.signal,
    });

    if (resposta.status === 403) {
      throw new Error(
        "O YouTube bloqueou a consulta. Confira a chave, as permissões e a cota da API."
      );
    }

    if (!resposta.ok) {
      throw new Error("Não foi possível consultar os vídeos no YouTube.");
    }

    const dados: RespostaYoutube = await resposta.json();

    if (!Array.isArray(dados.items)) {
      throw new Error("O YouTube retornou uma resposta inesperada.");
    }

    const materiais: MaterialReforco[] = [];

    for (const video of dados.items) {
      const id = video.id?.videoId;

      if (
        !id ||
        typeof video.snippet?.title !== "string" ||
        typeof video.snippet?.channelTitle !== "string"
      ) {
        continue;
      }

      materiais.push({
        id: id,
        titulo: video.snippet.title,
        canal: video.snippet.channelTitle,
        link: "https://www.youtube.com/watch?v=" + encodeURIComponent(id),
      });
    }

    return materiais;
  } catch {
    if (controle.signal.aborted) {
      throw new Error(
        "O YouTube demorou para responder. Tente novamente."
      );
    }

    throw new Error(
      "Não foi possível buscar os vídeos. Confira a conexão, a chave e a cota da API."
    );
  } finally {
    clearTimeout(tempoLimite);
  }
}