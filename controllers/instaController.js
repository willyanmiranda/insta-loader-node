const { IgApiClient } = require('instagram-private-api');
const ig = new IgApiClient();

const getPosts = async (req, res) => {
    const { perfil } = req.params;
    const loginUser = process.env.login;
    const passwordUser = process.env.password;

    ig.state.generateDevice(perfil);

    await ig.account.login(loginUser, passwordUser);

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
        })
    });
    res.json(postsArr)
}

module.exports = { getPosts };