# Avaliando a performance da minha aplicação

## Introdução
Este relatório aborda a utilização de requisições HTTP em testes de carga, utilizando a ferramenta k6. O k6 é uma ferramenta de código aberto para testes de carga e de performance que permite aos desenvolvedores criar e executar testes em JavaScript.

## Tecnologia e Conceitos Principais

### HTTP Requests
- **POST Request:** Utilizada para enviar dados para o servidor. No exemplo, é utilizado o método `http.post()` para enviar um payload JSON para autenticar em um serviço.
- **Outros Métodos:** O módulo `http` do k6 suporta diversos outros métodos HTTP, como GET, DELETE, HEAD, OPTIONS, PATCH, PUT, e a função genérica `request()` para qualquer tipo de requisição HTTP. Mas para esse teste especifico utilizaremos como exemplo o POST.

### Tags de Requisição HTTP
- **Tags Automáticas:** O k6 automaticamente aplica tags às requisições HTTP, como método, status, e URL, para facilitar a organização e filtragem dos resultados.
- **Customização de Tags:** É possível customizar tags, como o nome da requisição, para facilitar a análise de métricas. Por exemplo, agrupando URLs sob uma única tag comum.

### Testes de Carga
- **Testes Dinâmicos:** Para casos onde os URLs das requisições são dinâmicos, é importante agrupar os dados para evitar que uma grande quantidade de URLs únicos sobrecarregue a análise de métricas.
- **Alternativa de Agrupamento:** Além de definir manualmente as tags, é possível utilizar a função `http.url` para definir o nome da tag com um template de string.

## Relatório do Código - Detalhes da Implementação

O teste de carga implementado tem como objetivo simular a distribuição de pesquisas por meio de requisições HTTP para o servidor hospedado na AWS EC2. Foi utilizada a ferramenta k6 para realizar requisições POST em um endpoint específico, avaliando métricas como taxa de erro, tempo de resposta, taxa de transferência e tempo de conexão.

#### Requisições HTTP
- O teste consiste em realizar requisições POST para o endpoint `http://54.174.44.249:8080/distribuitions/`.
- Cada requisição envia um payload JSON contendo informações sobre a distribuição da pesquisa.
- As requisições são enviadas em um loop contínuo, com uma pausa de 1 segundo entre cada requisição.

#### Métricas Avaliadas
- **Taxa de Erro:** É calculada a partir do status da resposta da requisição, onde qualquer status igual ou superior a 400 é considerado um erro.
- **Tempo de Resposta:** O tempo de resposta de cada requisição é registrado e analisado para identificar padrões de desempenho.
- **Taxa de Transferência:** É calculada com base no tempo de resposta e no tamanho do corpo da resposta.
- **Tempo de Conexão:** O tempo de conexão é registrado para avaliar o desempenho da conexão com o servidor.

#### Critérios de Validação
- O teste inclui validações para garantir que as respostas das requisições estejam de acordo com as expectativas:
  - Verificação de que o status da resposta seja 201 (Created).
  - Verificação de que o tempo de resposta seja inferior a 200ms.
  - Verificação de que o corpo da resposta contenha o nome da distribuição da pesquisa.
  - Verificação de que o cabeçalho da resposta contenha o tipo de conteúdo 'application/json'.

O teste de carga implementado demonstra o comportamento de POST de distribuição de pesquisas por meio de requisições HTTP. As métricas avaliadas permitem identificar possíveis gargalos de desempenho e falhas no servidor, garantindo a qualidade e confiabilidade do sistema em produção. As validações adicionadas asseguram que as respostas das requisições estejam conforme o esperado, contribuindo para a detecção precoce de problemas e a melhoria contínua do sistema.

## Registro Visual do processo - Resultados

Realizamos um teste de carga utilizando o k6 junto com uma biblioteca que gera um resumo visual em HTML dos resultados (K6 HTML Report Exporter). Essa combinação de ferramentas permite não apenas executar testes de carga robustos, mas também apresentar os dados de forma clara e interativa, facilitando a análise e compreensão dos resultados. Docs completa da API: https://github.com/benc-uk/k6-reporter

#### Output do terminal

![Output do terminal](./assets/output.png)

### Request Metrics

![Request Metrics](./assets/requestMetrics.png)

Essa foto mostra várias métricas relacionadas a requisições HTTP:

#### Request Metrics

- Total de Requisições: O sistema processou 1.046.766 requisições durante o teste.
- Requisições Falhas: Observamos 203.563 falhas, o que representa uma taxa significativa de falhas que precisam ser investigadas.
- Duração da Requisição e Espera (http_req_duration, http_req_waiting): Os valores máximos são extremamente altos (cerca de 59 segundos), o que é atípico e preocupante para a maioria das aplicações web. As medianas, em torno de 1,7 segundos, também estão altas, indicando atrasos substanciais na resposta.
- Conectividade (http_req_connecting): As conexões parecem estabelecer rapidamente, o que é positivo.
- Recebimento de Dados (http_req_receiving): Os tempos são baixos, sugerindo que a transferência de dados do servidor para o cliente é eficiente.
- Bloqueio de Requisições (http_req_blocked): Há casos de bloqueio, mas a mediana é 0, indicando que não é um problema frequente.
- Duração da Iteração (iteration_duration): A duração média das iterações é alta, reforçando os indícios de atrasos no processamento das requisições.

#### Custom Metrics

- Tempo de Conexão (connection_time): Os tempos variam, mas a média é razoável, indicando que a conexão em si não é a fonte do problema.
- Erros (errors): Embora não haja dados específicos fornecidos, o campo sugere que erros foram monitorados.
- Tempo de Resposta (response_time): Alinhado com a duração da requisição, indicando que os tempos de resposta são uma área crítica.
- Taxa de Transferência (transfer_rate): Os dados mostram taxas de transferência variáveis, com máximos altos e uma média decente.

### Other Stats

![Other Stats](./assets/otherStats.png)

A segunda foto fornece detalhes sobre verificações personalizadas, que são condições ou afirmações que o teste verifica, como:

- Verificações Passadas e Falhas: Um número expressivo de falhas em verificações (831.504 falhas) indica que muitas das respostas do servidor não estavam de acordo com o esperado.
- Usuários Virtuais: O teste foi executado com até 9.998 usuários virtuais simultâneos, fornecendo um teste de carga significativo no sistema.

### Checks & Groups

![Checks & Groups](./assets/checksGroups.png)

A terceira foto exibe as estatísticas gerais do teste:

- Checks: Afirmações durante o teste.
- Iterations: O número de vezes que o teste foi executado.
- Virtual Users: Usuários simulados fazendo requisições.
- Data Received e Data Sent: Quantidade de dados transferidos.
- Importante!: Uma checagem importante, "response time is less than 200ms", falhou em muitas ocasiões, com 831.504 falhas, ressaltando problemas com o tempo de resposta do sistema.

### Conclusão dos Resultados

O teste revela problemas significativos com a estabilidade e desempenho do endpoint, que sugerem que o sistema não esta preparado para lidar com cargas elevadas de usuário. A alta taxa de solicitações falhas e checagens falhas é um alerta que não pode ser ignorado. O nosso sistema precisa de otimizações e mudanças no código para lidar melhor com cargas altas e garantir respostas rápidas e confiáveis. Os proximos passos incluem uma investigação das causas das falhas e uma revisão das configurações do servidor, código de aplicação, e infraestrutura de suporte. Melhorias na escalabilidade, otimização de código e aumento de recursos tambés são necessárias para atender aos padroes do teste.

## Conclusão
A utilização de requisições HTTP em testes de carga é essencial para avaliar o desempenho e a robustez de aplicações. Com o k6, podemos criar testes robustos e analisar os resultados de forma eficiente, garantindo assim a qualidade e performance das aplicações. A customização de tags e o agrupamento de dados são técnicas importantes para simplificar a análise dos resultados em testes com URLs dinâmicos.
