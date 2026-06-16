<task>
Painel de clima
</task>

<goal>
Permitir que o usuario digite uma cidade no frontend e visualize o clima atual e a previsao dos proximos 7 dias dessa localidade. Os dados devem ser obtidos pelo backend a partir da API Open-Meteo.
</goal>

<requirements>
Negocio:
- Permitir que o usuario informe uma cidade para consulta do clima atual.
- Exibir no painel as principais informacoes climaticas atuais da cidade encontrada.
- Exibir a previsao de 7 dias com temperatura minima e maxima de cada dia.
- Exibir velocidade do vento e indice UV junto aos dados climaticos.
- Exibir sensacao termica, umidade relativa do ar, probabilidade de chuva e condicao do tempo com icone.
- Opcionalmente sugerir uma cidade automaticamente usando a geolocalizacao do navegador.

Arquitetura:

- Implementar a funcionalidade no frontend e no backend existentes.
- O backend deve ser responsavel por integrar com a Open-Meteo, converter cidade em coordenadas e buscar os dados climaticos.
- O frontend deve consumir somente o endpoint do backend, sem chamar diretamente as APIs externas.

UI/UX:

- Exibir um campo de busca para o usuario digitar a cidade.
- Exibir um painel com o clima atual apos uma consulta bem-sucedida.
- Definir livremente a identidade visual, priorizando legibilidade, hierarquia das informacoes e consistencia na interface.
- Aplicar um background dinamico em gradiente de acordo com a condicao do clima, como ceu limpo, nublado, chuva, tempestade ou noite.
- Exibir velocidade do vento, indice UV, sensacao termica, umidade e probabilidade de chuva em area de destaque ou indicadores do painel.
- Exibir a condicao do tempo com texto e icone correspondente.
- Renderizar a previsao de 7 dias em uma visualizacao semelhante a um grafico, destacando temperaturas minimas e maximas.
- Exibir a previsao de 7 dias como uma lista grafica horizontal ou vertical, com barras de amplitude entre temperatura minima e maxima.
- Usar cores e icones para comunicar rapidamente condicao do tempo, chuva, UV, vento e variacao de temperatura.
- Garantir layout responsivo com experiencia mobile-first.
- Exibir feedback de carregamento, cidade nao encontrada ou erro na consulta.
  </requirements>

<api_contracts>
APIs externas:

- Open-Meteo Geocoding API: https://geocoding-api.open-meteo.com/v1/search para converter cidade em coordenadas.
- Open-Meteo Weather API: https://api.open-meteo.com/v1/forecast para obter dados atuais do clima, sensacao termica, umidade, velocidade do vento, indice UV, probabilidade de chuva, condicao do tempo e previsao diaria de 7 dias com temperaturas minima e maxima.

APIs de backend:

- GET /weather?city={cidade} - Buscar o clima atual e a previsao de 7 dias de uma cidade informada pelo usuario.
- Resposta de sucesso: JSON contendo dados da cidade encontrada, informacoes atuais do clima, sensacao termica, umidade, velocidade do vento, indice UV, probabilidade de chuva, condicao do tempo com identificador para icone e previsao diaria de 7 dias com temperatura minima e maxima retornadas pela Open-Meteo.
- Respostas de erro: 400 para cidade ausente ou invalida, 404 para cidade nao encontrada, 502 para falha na integracao com a Open-Meteo.
  </api_contracts>

<acceptance_criteria>

- Dado que o usuario esta no painel de clima, quando digitar uma cidade valida e enviar a busca, entao o sistema deve exibir o clima atual da cidade.
- Dado que a consulta retornar dados validos, quando o painel for renderizado, entao o sistema deve exibir velocidade do vento, indice UV, sensacao termica, umidade e probabilidade de chuva.
- Dado que a consulta retornar a condicao do tempo, quando o painel for renderizado, entao o sistema deve exibir um texto e um icone correspondente a essa condicao.
- Dado que o usuario pesquisou uma cidade valida, quando os dados forem carregados, entao o sistema deve exibir um grafico com a previsao de 7 dias e as temperaturas minima e maxima de cada dia.
- Dado que a cidade informada existe, quando o frontend buscar os dados, entao a requisicao deve ser feita ao backend e o backend deve consultar a Open-Meteo.
- Dado que a cidade nao for encontrada ou ocorrer erro na API externa, quando o usuario fizer a busca, entao o frontend deve exibir uma mensagem de erro clara.
  </acceptance_criteria>

<constraints>
- FAÇA: criar um endpoint no backend para o frontend consumir.
- FAÇA: utilizar a API Open-Meteo sem API key para geocodificacao e dados climaticos.
- FAÇA: solicitar na Weather API os campos necessarios para sensacao termica, umidade, velocidade do vento, indice UV, probabilidade de chuva, condicao do tempo e temperaturas minima e maxima diarias.
- FAÇA: mapear os codigos de condicao do tempo da Open-Meteo para textos e icones compreensiveis no frontend.
- FAÇA: variar o gradiente de fundo conforme a condicao climatica retornada pela API.
- NÃO FAÇA: expor chamadas diretas do frontend para as APIs externas da Open-Meteo.
- NUNCA: depender de chave de API ou servico pago para obter os dados de clima.
</constraints>
