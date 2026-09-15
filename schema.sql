-- Schema do blog para rodar no SQL Editor do Supabase
-- Cria a tabela "posts" com suporte a categoria, e insere os dados de exemplo
-- que já existiam nos models antigos (articles.js e games.js)

create table if not exists posts (
  id bigint generated always as identity primary key,
  titulo text not null,
  descricao text not null,
  categoria text not null default 'geral',
  thumb_image text,
  thumb_image_alt_text text,
  profile_thumb_image text,
  profile_name text,
  post_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice para acelerar filtros por categoria
create index if not exists idx_posts_categoria on posts (categoria);

-- Trigger para manter "updated_at" sempre atualizado quando o post é editado
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_posts_updated_at on posts;
create trigger trg_posts_updated_at
before update on posts
for each row
execute function set_updated_at();

-- Dados de exemplo (equivalentes aos que estavam fixos em models/articles.js e models/games.js)
insert into posts (titulo, descricao, categoria, thumb_image, thumb_image_alt_text, profile_thumb_image, profile_name, post_date) values
('Google Notícias completa 20 anos com redesign e fundo de apoio ao jornalismo independente',
 'Na última semana, o Google apresentou uma nova versão para desktop do seu serviço de notícias. Após um redesign profundo, o Google Notícias promete informar mais sobre os temas que os usuários acompanham, com mais profundidade e facilidade de acesso – seja lendo no smartphone ou, agora, no computador.',
 'tecnologia', 'https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2023/02/221223090506-01-bugatti-chiron-profilee.jpg', 'Google', '/images/profile-1.jpg', 'Fernando Silva', '2022-03-01'),

('Vendas do Macbook Pro com chip M2 começam nesta sexta-feira (24)',
 'Durante a WWDC deste ano, a Apple anunciou diversas novidades em seus sistemas e produtos, incluindo um Macbook Air redesenhado e com a segunda geração de chips da empresa, o M2.',
 'tecnologia', 'https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2023/02/221223090506-01-bugatti-chiron-profilee.jpg', 'Apple', '/images/profile-2.jpg', 'Paula Ramos', '2022-03-01'),

('Citroen Ami Buggy: O carro mais simpático que você já viu até hoje',
 '17 minutos para esgotar e apenas 2 minutos e 53 segundos para vender a primeira unidade. Estes são os números (incríveis) das vendas das 50 unidades especiais e ultra limitadas do My Ami Buggy, da Citroen.',
 'carros', 'https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2023/02/221223090506-01-bugatti-chiron-profilee.jpg', 'Carros', '/images/profile-3.jpg', 'Rodrigo Silveira', '2022-03-01'),

('SEGA anuncia Hyenas, novo FPS no espaço pós-apocalíptico',
 'O mundo dos jogos competitivos nunca foi tão diverso, e o anúncio feito pela SEGA nesta quarta-feira (22) promete contribuir com outro título promissor.',
 'games', 'https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2023/02/221223090506-01-bugatti-chiron-profilee.jpg', 'Games', '/images/profile-4.jpg', 'Lucas Oliveira', '2022-06-10'),

('Metaverso explode em discussões na internet, mas público ainda tem receios',
 'De acordo com números consolidados pela Comscore, apenas 24% dos comentários da internet sobre o metaverso são positivos. O motivo, por sua vez, seria o desconhecimento do público acerca do assunto, que ainda desperta dúvidas e receios em muita gente.',
 'tecnologia', 'https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2023/02/221223090506-01-bugatti-chiron-profilee.jpg', 'Metaverso', '/images/profile-1.jpg', 'Maria Silva', '2022-06-10'),

('Como o metaverso e a web3 revolucionarão a vida e os negócios?',
 'A ideia de criar mundos inteiramente fictícios e com possibilidades infinitas sempre encantou o ser humano. Seja nas antigas tradições orais, na literatura, nas telas do cinema ou nos jogos, mais recentemente, o desejo pela materialização daquilo que somente a criatividade e a mente podem elaborar move montanhas, além de muito dinheiro.',
 'tecnologia', 'https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2023/02/221223090506-01-bugatti-chiron-profilee.jpg', 'Web3', '/images/profile-2.jpg', 'Debora Pacheco', '2022-06-10'),

('Google Notícias completa 20 anos com redesign e fundo de apoio ao jornalismo independente',
 'Na última semana, o Google apresentou uma nova versão para desktop do seu serviço de notícias. Após um redesign profundo, o Google Notícias promete informar mais sobre os temas que os usuários acompanham, com mais profundidade e facilidade de acesso – seja lendo no smartphone ou, agora, no computador.',
 'games', 'https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2023/02/221223090506-01-bugatti-chiron-profilee.jpg', 'Google', '/images/profile-1.jpg', 'Fernando Silva', '2022-03-01'),

('Vendas do Macbook Pro com chip M2 começam nesta sexta-feira (24)',
 'Durante a WWDC deste ano, a Apple anunciou diversas novidades em seus sistemas e produtos, incluindo um Macbook Air redesenhado e com a segunda geração de chips da empresa, o M2.',
 'games', 'https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2023/02/221223090506-01-bugatti-chiron-profilee.jpg', 'Apple', '/images/profile-2.jpg', 'Paula Ramos', '2022-03-01');
