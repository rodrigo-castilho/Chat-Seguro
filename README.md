#  Aplicação de Mensagens Criptografadas com Proteção CSRF

Este é um projeto de exemplo que demonstra como utilizar **criptografia AES** para proteger mensagens e como implementar **proteção contra ataques CSRF** usando **Flask** e **Flask-WTF**.

##  Tecnologias Utilizadas

- Python 3
- Flask
- Flask-WTF (proteção CSRF)
- Crypto (PyCryptodome)
- HTML/CSS/JS

##  Como Executar

1. **Instale as dependências:**

```bash
pip install flask flask-wtf pycryptodome
```

2. **Execute o backend:**

```bash
python app.py
```

3. **Acesse a aplicação no navegador:**

```
http://localhost:5000
```

---

## Funcionalidade de Criptografia

- As mensagens enviadas são criptografadas com **AES-128 em modo CBC** usando uma chave aleatória gerada a cada execução do servidor.
- Cada mensagem é armazenada com seu vetor de inicialização (IV) para que possa ser descriptografada corretamente depois.
- O frontend exibe tanto as **mensagens criptografadas** quanto as **mensagens descriptografadas**.

---

##  Proteção CSRF

- A aplicação gera um **token CSRF por sessão**, armazena-o como **cookie** e o requer como **cabeçalho (`X-CSRFToken`)** nas requisições POST.
- Se o token não estiver presente ou for inválido, a requisição é rejeitada com erro HTTP 403.


## Validacao 

- A validação é feita dentro do proprio site **um botão ao lado direito** te redireciona para as validacoes.
- Para o erro 400, somente abre o network do seu cliente ou o terminal que aparecera a mensagem 400
