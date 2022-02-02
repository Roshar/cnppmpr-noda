const expressHbs =  require('express-handlebars');

// для работы с шаблоном при генерации pdf отчета по слушателям
const hbs = expressHbs.create({});

// регистрация хелпера для инкремента в цикле
hbs.handlebars.registerHelper('increaseIndex', function(num) {
    num+=1;
    return num;
})

// регистрация хелпера для фильрации битых ссылок (ссылки без указания протокола - https)
hbs.handlebars.registerHelper('filterLink', function(link) {
    if(link) {
        const httpPosition = link.search('://')
        return (httpPosition !== -1) ? link : 'https://' + link
    }
})