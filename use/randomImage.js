const generationAvatar = async(gender) => {
    const randomImage = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        let res = Math.floor(Math.random() * (max - min)) + min;
        return String(res)
    }
    return (gender === 'man') ? '/avatar/man'+ randomImage(0,4)  +'.png' : '/avatar/woman'+ randomImage(0,2)  +'.png'
}


module.exports = generationAvatar