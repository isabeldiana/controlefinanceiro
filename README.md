# controle financeiro
link da aplicação: https://ruby-witty-bat.cyclic.app/

## RESTful API que permite controle financeiro pessoal, a aplicação realiza a gestão de gastos pessoais. 


## O que o usuário pode fazer


- fazer cadastro.
- fazer login.
- ver os dados do seu perfil e editar os dados do seu perfil.
- Listar categorias
- Listar transações
- Detalhar transação
- Cadastrar transação
- Editar transação
- Remover transação
- Obter extrato de transações
- [Extra] Filtrar transações por categoria

Passo a passo utilização da api:

#### rota `Post` cadastro de usuario:
- ruby-witty-bat.cyclic.app/usuarios

```javascript
{
    "nome": "teste",
    "email": "teste@email.com",
    "senha": "123456"
}
```
#### rota `Post` login de usuario:
- ruby-witty-bat.cyclic.app/login
  
```javascript

{
 "email": "jose@email.com",
 "senha": "123456"

}

```

#### rota `Get` detalhar perfil
- Utilizar o token de login
- ruby-witty-bat.cyclic.app/usuario/logado


#### rota `Put` editar perfil
- Utilizar o token de login
- ruby-witty-bat.cyclic.app/usuario
  
{
    "nome": "teste",
    "email": "teste@email.com",
    "senha": "123456"

}
#### rota `Get` categorias
- Utilizar o token de login
- ruby-witty-bat.cyclic.app/categoria

#### rota  `Get` 
- Utilizar o token de login
- ruby-witty-bat.cyclic.app/transacao

#### rota `Get` 
- Utilizar o token de login
- ruby-witty-bat.cyclic.app/transacao/id

#### rota `Post` cadastrar transacao 

- Utilizar o token de login
- ruby-witty-bat.cyclic.app/transacao/id
```javascript
// POST /transacao
{
    "tipo": "entrada",
    "descricao": "Salário",
    "valor": 300000,
    "data": "2022-03-24",
    "categoria_id": 6
}
```

#### `put` editar  transacao

- Utilizar o token de login
- ruby-witty-bat.cyclic.app/transacao/id

#### PUT /transacao/2
{
	"descricao": "Sapato amarelo",
	"valor": 15800,
	"data": "2022-03-23 12:35:00",
	"categoria_id": 4,
	"tipo": "saida"
}


#### `delete` excluir transacao

- Utilizar o token de login
- ruby-witty-bat.cyclic.app/transacao/id










