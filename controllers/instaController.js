const { IgApiClient } = require('instagram-private-api');
const fs = require('fs').promises;
const ig = new IgApiClient();

const getPosts = async (req, res) => {
    const { perfil } = req.params;
    const maxPosts = 50;

    ig.state.generateDevice(perfil);

    try {
        const savedState = await fs.readFile('./cookies.json', 'utf-8');
        await ig.state.deserialize(savedState);
        console.log('Cookies carregados com sucesso!');
    } catch (error) {
        console.log('Nenhum cookie salvo, fazendo login...');
        const loginUser = process.env.login;
        const passwordUser = process.env.password;

        await ig.account.login(loginUser, passwordUser);

        const serializedState = await ig.state.serialize();
        delete serializedState.constants;
        await fs.writeFile('./cookies.json', JSON.stringify(serializedState), 'utf-8');
        console.log('Cookies salvos com sucesso!');
    }

    try {
        const user = await ig.user.searchExact(perfil);
        const userFeed = ig.feed.user(user.pk);
        
        let postsArr = [];
        let moreAvailable = true;

        while (moreAvailable && postsArr.length < maxPosts) {
            const posts = await userFeed.items(); 
            posts.forEach(post => {
                postsArr.push({
                    'Id': post.id,
                    'Legenda': post.caption ? post.caption.text : 'Sem legenda',
                    'Imagem': post.image_versions2 ? post.image_versions2.candidates[0].url : 'Sem imagem',
                    'Curtidas': post.like_count,
                    'Comentários': post.comment_count
                });
            });

            moreAvailable = userFeed.isMoreAvailable();
        }

        res.json(postsArr.slice(0, maxPosts));

    } catch (error) {
        console.log('Deu erro:', error.message);
        res.status(500).json({ error: 'Erro ao buscar posts' });
    }
}

module.exports = { getPosts };