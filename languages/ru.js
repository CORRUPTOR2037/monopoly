strings = {
    'select-players-number': 'Выберите количество игроков: ',
    'human': 'Человек',
    'start-game': 'Начать игру',
    'ai': 'Бот',
    'easy': 'Просто',
    'normal': "Средне",
    'hard': "Тяжело",
    'very hard': "Очень тяжело",
    'impossible': "Невозможно",
    "conservative": "Консерватор",
    "communist": "Коммунист",
    "populist": "Популист",
    "socialist": "Социалист",
    "traditionalist": "Традиционалист",
    "economist": "Экономист",
    "democrat": "Демократ",
    "liberal": "Либерал",
    "green": "Зелёный",
    "monarchist": "Монархист",
    "progressivist": "Прогрессивист",
    "nationalist": "Националист",
    "libertartian": "Либертарианец",
    "right": "Правый",
    "marxist": "Марксист",
    "ultraconservative": "Ультраконсерватист",
    "pirate": "Пират"
}

function setString(ind, obj) {
    if (obj.tagName.toLowerCase() == 'input') {
        obj.value = strings[obj.id];
    } else {
        obj.innerHTML = strings[obj.id];
    }
}

function getString(key) {
    return strings[key];
}