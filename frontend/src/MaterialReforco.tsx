import { useState } from "react";

type Material = {
  id: string;
  titulo: string;
  canal: string;
  link: string;
};

type MaterialReforcoProps = {
  token: string;
  desempenhoId: number;
};

export default function MaterialReforco({
  token,
  desempenhoId,
}: MaterialReforcoProps) {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [competencia, setCompetencia] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [consultado, setConsultado] = useState(false);
  const [visivel, setVisivel] = useState(false);
  const [erro, setErro] = useState("");

  async function buscarMateriais() {
    if (carregando) {
      return;
    }

    if (consultado) {
      setVisivel(!visivel);
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch(
        "/api/desempenhos/" + desempenhoId + "/reforco",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.mensagem ?? "Não foi possível buscar os materiais."
        );
        return;
      }

      setMateriais(dados.materiais);
      setCompetencia(dados.competencia);
      setConsultado(true);
      setVisivel(true);
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  let textoBotao = "Buscar material de reforço";

  if (carregando) {
    textoBotao = "Buscando...";
  } else if (consultado && visivel) {
    textoBotao = "Ocultar materiais";
  } else if (consultado) {
    textoBotao = "Mostrar materiais";
  }

  return (
    <div>
      <button
        type="button"
        onClick={buscarMateriais}
        disabled={carregando}
      >
        {textoBotao}
      </button>

      {erro && <p role="alert">{erro}</p>}

      {visivel && (
        <section>
          <h3>Reforço: {competencia}</h3>

          {materiais.length === 0 ? (
            <p>Nenhum vídeo encontrado para esta competência.</p>
          ) : (
            <>
              <p>
                Sugestões do YouTube para complementar os estudos.
                Confira se o conteúdo corresponde ao que foi
                trabalhado em aula.
              </p>

              <ul>
                {materiais.map((material) => (
                  <li key={material.id}>
                    <a
                      href={
                        "https://www.youtube.com/watch?v=" +
                        encodeURIComponent(material.id)
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {material.titulo}
                    </a>

                    <p>Canal: {material.canal}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
}