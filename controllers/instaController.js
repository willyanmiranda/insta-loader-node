const { IgApiClient } = require('instagram-private-api');
const fs = require('fs').promises; // Para manipular arquivos assíncronos
const ig = new IgApiClient();

const getPosts = async (req, res) => {
    const { perfil } = req.params;

    ig.state.generateDevice(perfil);

    // Tente restaurar o estado (cookies) do arquivo
    try {
        const savedState = await fs.readFile('./cookies.json', 'utf-8');
        await ig.state.deserialize(savedState); // Restaurar estado salvo
        console.log('Cookies carregados com sucesso!');
    } catch (error) {
        // Se não houver cookies salvos, fazer login com usuário e senha
        console.log('Nenhum cookie salvo, fazendo login...');
        const loginUser = process.env.login;
        const passwordUser = process.env.password;

        await ig.account.login(loginUser, passwordUser);

        // Após o login, salve o estado (cookies) no arquivo
        const serializedState = await ig.state.serialize();
        delete serializedState.constants; // Não precisamos salvar constantes internas
        await fs.writeFile('./cookies.json', JSON.stringify(serializedState), 'utf-8');
        console.log('Cookies salvos com sucesso!');
    }

    // Depois de autenticar, buscar o perfil e os posts
    const user = await ig.user.searchExact(perfil);
    const userFeed = ig.feed.user(user.pk);

    const posts = await userFeed.items();

    let postsArr = [];

    posts.forEach(post => {
        postsArr.push({
            'Id': post.id,
            'Legenda': post.caption ? post.caption.text : 'Sem legenda',
            'Imagem': post.image_versions2 ? post.image_versions2.candidates[0].url : 'Sem imagem',
            'Curtidas': post.like_count,
            'Comentários': post.comment_count
        });
    });

    res.json(postsArr);
}

module.exports = { getPosts };