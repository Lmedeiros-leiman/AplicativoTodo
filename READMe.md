considero esse projeto um fracasso.

o Domain básicamente não propaga alterações pros projetos que dependem.
temos acho que 4-8 tipos e variantes de um unico tipo.

nisso acaba tendo um projeto onde:
 - adicionar qualquer coisa é uma dor.
 - alterações e bugs por alterações só se revelam em runtime.
    - ao invés de serem reveladas ao mudar o tipo e passar um typecheck no sistema.

era muito melhor se tivesse só tipado o servidor com Drizzle e cortasse fora o pacote Todo e utilizasse o Drizzle como fonte de verdade pro servidor E pro frontend.

ainda acho que tem chance pro DDD nesse estilo de vingar, mas preciso achar um jeito de separar a entidade do dominio, que é utilizado em todo lugar e as suas variantes para cada situação mas manter tipagem caso altere o dominio do projeto, incluindo nos tipos derivados...