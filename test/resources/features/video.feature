Feature: Gerenciamento de Vídeos
  Como um usuário autenticado
  Eu quero fazer upload, listar e baixar vídeos
  Para que eu possa gerenciar meus arquivos

  Scenario: Upload de um vídeo válido
    Given que o usuário está autenticado
    When ele envia um vídeo para upload
    Then o sistema retorna um status 200
    And retorna os detalhes do vídeo

  Scenario: Listar vídeos do usuário
    Given que o usuário solicita seus vídeos
    When o sistema busca os vídeos do usuário
    Then retorna a lista de vídeos disponíveis

  Scenario: Download de um vídeo pelo ID
    Given que o usuário solicita o download do vídeo com id "123"
    When o sistema busca o vídeo pelo ID
    Then retorna o arquivo do vídeo
