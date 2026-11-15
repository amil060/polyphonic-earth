// Interface languages: English, Azerbaijani, Spanish, Russian.
// Scientific detail panels stay in English for accuracy; everything a first-time visitor
// needs to start, play, explore and understand each scene is translated.

export const LANGS = { en: 'English', az: 'Azərbaycanca', es: 'Español', ru: 'Русский' };

const S = {
  en: {
    theme: 'Play our theme song', themeStop: 'Stop the theme song', themeBy: 'Original music by our teammate',
    failStart: 'Sound could not start on this device. Tap play again, or choose Explore without sound below.', tapAgain: 'Tap play once more to turn the sound on. On iPhone, also check the silent switch and volume.',
    legend1: 'Sound legend · 1 of 2', legend2: 'Sound legend · 2 of 2', lowest: 'Lowest note', highest: 'Highest note', means: 'means', now: 'Now listen', sweep: 'The sweep plays west → east', loading: 'Loading sounds…',
    q: 'NASA’s maps of our changing planet speak only to the eyes. Polyphonic Earth turns them into music anyone can hear, including people who are blind or have low vision.', hp: 'Best with headphones', menu: 'Menu',
    choose: 'How do you want to explore?', mListen: 'I listen', mListenSub: 'For blind and low-vision visitors. Everything is read aloud and explained before it plays.', mWatch: 'I watch', mWatchSub: 'For deaf and hard-of-hearing visitors. A silent map with captions for every note.', mBoth: 'Listen and watch', mBothSub: 'Sound and visuals together, with a short guide.', a11y: 'Accessibility settings',
    howTo: 'How to listen', startMusic: 'Start the music', guideNote: 'You can turn this guide off in Listening settings.',
    'tour': 'Hear all five in 60 s', 'tourStop': 'Stop tour', 'tourStep': 'Tour', 'nar.ocean': 'I am the ocean. My warm water sings high, my cold water sings low.', 'nar.nightlights': 'We are the lights of your cities. Listen to us grow from 2012 to 2023.', 'nar.lightning': 'I am lightning. Every drum is a storm somewhere on Earth.', 'nar.co2': 'I am carbon dioxide. Hear the calm chord grow tense as I spread.', 'nar.caspian': 'I am Azerbaijan, from Nakhchivan to Baku. Each bar is a decade: hear every city grow warmer.',
    cta: 'Listen to Earth', back: 'Back to the map', visual: 'Explore without sound',
    why: 'A jukebox that turns NASA’s pictures of Earth into music, so anyone, including people who are blind, can explore our changing planet by ear.',
    s1b: '1 · NASA pictures', s1: 'Real NASA animations: ocean temperature, city lights at night, lightning, CO₂ and our home region.',
    s2b: '2 · Colours become numbers', s2: 'The app reads the colour of every pixel and turns it back into the data it shows.',
    s3b: '3 · Numbers become music', s3: 'A high value plays a high note. West sounds in your left ear, east in your right. Silence means no data.',
    sub: 'Headphones recommended · Each scene starts by playing its lowest and highest note',
    about: 'What is this?', settings: 'Listening settings', keys: 'Keyboard',
    play: 'Play', pause: 'Pause', again: 'Play again', touch: 'Listen by Touch', describe: 'Describe',
    read: 'How to read this scene', hear: 'What am I hearing?', data: 'NASA data', sound: 'Sound', meaning: 'Meaning', limits: 'Limits',
    aboutTitle: 'About the project', lang: 'Language',
    'listen.ocean': 'High note = warm water · low note = cold water · soft knock = land · left ear = west',
    'listen.nightlights': 'Louder, higher bell = brighter city · the drone rises as the world gets brighter · left ear = the Americas',
    'listen.lightning': 'Each drum hit = lightning · deep boom = tropical storm · higher drum = far from the equator',
    'listen.co2': 'Higher note = more CO₂ · the chord shimmers and beats as CO₂ rises · rumble = how much is covered',
    'listen.caspian': 'One note = one city, west to east · each bar = one decade · higher = warmer than its 1980s',
  },
  az: {
    theme: 'Mövzu mahnımızı dinlə', themeStop: 'Mövzu mahnısını dayandır', themeBy: 'Komanda üzvümüzün orijinal bəstəsi:',
    failStart: 'Bu cihazda səs başlaya bilmədi. Yenidən toxunun və ya aşağıda “Səssiz kəşf et” seçin.', tapAgain: 'Səsi açmaq üçün bir dəfə də toxunun. iPhone-da səssiz rejim düyməsini və səs səviyyəsini də yoxlayın.',
    legend1: 'Səs açarı · 1/2', legend2: 'Səs açarı · 2/2', lowest: 'Ən aşağı nota', highest: 'Ən yüksək nota', means: 'deməkdir:', now: 'İndi dinləyin', sweep: 'Tarama qərbdən şərqə gedir', loading: 'Səslər yüklənir…',
    q: 'NASA-nın dəyişən planetimiz haqqında xəritələri yalnız gözə danışır. Polyphonic Earth onları hər kəsin, o cümlədən görməyən və zəif görən insanların eşidə biləcəyi musiqiyə çevirir.', hp: 'Qulaqlıqla daha yaxşıdır', menu: 'Menyu',
    choose: 'Necə kəşf etmək istəyirsiniz?', mListen: 'Dinləyirəm', mListenSub: 'Görməyən və zəif görən insanlar üçün. Hər şey səsli oxunur və çalınmazdan əvvəl izah olunur.', mWatch: 'İzləyirəm', mWatchSub: 'Kar və zəif eşidən insanlar üçün. Hər nota üçün altyazılı səssiz xəritə.', mBoth: 'Dinlə və izlə', mBothSub: 'Səs və görüntü birlikdə, qısa bələdçi ilə.', a11y: 'Əlçatanlıq ayarları',
    howTo: 'Necə dinləməli', startMusic: 'Musiqini başlat', guideNote: 'Bu bələdçini Dinləmə ayarlarında söndürə bilərsiniz.',
    'tour': 'Beşini də 60 saniyədə dinlə', 'tourStop': 'Turu dayandır', 'tourStep': 'Tur', 'nar.ocean': 'Mən okeanam. İsti sularım yüksək, soyuq sularım alçaq səslə oxuyur.', 'nar.nightlights': 'Biz şəhərlərinizin işıqlarıyıq. 2012-dən 2023-ə necə artdığımızı dinləyin.', 'nar.lightning': 'Mən şimşəyəm. Hər zərb Yer üzündə haradasa bir fırtınadır.', 'nar.co2': 'Mən karbon qazıyam. Mən yayıldıqca sakit akkordun necə gərginləşdiyini eşidin.', 'nar.caspian': 'Mən Naxçıvandan Bakıya qədər Azərbaycanam. Hər xana bir onillikdir: hər şəhərin necə isindiyini eşidin.',
    cta: 'Yeri dinlə', back: 'Xəritəyə qayıt', visual: 'Səssiz kəşf et',
    why: 'NASA-nın Yer şəkillərini musiqiyə çevirən bir jukebox. Hər kəs, o cümlədən görmə qabiliyyəti olmayan insanlar, dəyişən planetimizi qulaqla kəşf edə bilər.',
    s1b: '1 · NASA şəkilləri', s1: 'Real NASA animasiyaları: okean temperaturu, gecə şəhər işıqları, şimşəklər, CO₂ və doğma bölgəmiz.',
    s2b: '2 · Rənglər rəqəmə çevrilir', s2: 'Tətbiq hər pikselin rəngini oxuyur və onu göstərdiyi dataya geri çevirir.',
    s3b: '3 · Rəqəmlər musiqiyə çevrilir', s3: 'Yüksək dəyər yüksək nota çalır. Qərb sol qulaqda, şərq sağ qulaqda səslənir. Səssizlik datanın olmaması deməkdir.',
    sub: 'Qulaqlıq tövsiyə olunur · Hər səhnə ən aşağı və ən yüksək notasını çalmaqla başlayır',
    about: 'Bu nədir?', settings: 'Dinləmə ayarları', keys: 'Klaviatura',
    play: 'Çal', pause: 'Fasilə', again: 'Yenidən çal', touch: 'Toxunaraq dinlə', describe: 'Təsvir et',
    read: 'Bu səhnəni necə oxumalı', hear: 'Nə eşidirəm?', data: 'NASA datası', sound: 'Səs', meaning: 'Məna', limits: 'Məhdudiyyətlər',
    aboutTitle: 'Layihə haqqında', lang: 'Dil',
    'listen.ocean': 'Yüksək nota = isti su · alçaq nota = soyuq su · yumşaq taqqıltı = quru · sol qulaq = qərb',
    'listen.nightlights': 'Daha uca və yüksək zəng = daha parlaq şəhər · dünya parladıqca dron yüksəlir · sol qulaq = Amerika',
    'listen.lightning': 'Hər təbil zərbəsi = şimşək · dərin gurultu = tropik fırtına · yüksək təbil = ekvatordan uzaq',
    'listen.co2': 'Yüksək nota = daha çox CO₂ · CO₂ artdıqca akkord titrəyir və döyünür · gurultu = örtülən sahə',
    'listen.caspian': 'Bir nota = bir şəhər, qərbdən şərqə · hər xana = bir onillik · yüksək = 1980-lərdən isti',
  },
  es: {
    theme: 'Escucha nuestro tema', themeStop: 'Detener el tema', themeBy: 'Música original de nuestro compañero',
    failStart: 'El sonido no pudo iniciarse en este dispositivo. Toca de nuevo o elige “Explorar sin sonido”.', tapAgain: 'Toca una vez más para activar el sonido. En iPhone, revisa también el interruptor de silencio y el volumen.',
    legend1: 'Leyenda sonora · 1 de 2', legend2: 'Leyenda sonora · 2 de 2', lowest: 'Nota más grave', highest: 'Nota más aguda', means: 'significa', now: 'Ahora escucha', sweep: 'El barrido va de oeste a este', loading: 'Cargando sonidos…',
    q: 'Los mapas de la NASA sobre nuestro planeta cambiante solo hablan a los ojos. Polyphonic Earth los convierte en música que cualquiera puede oír, incluidas las personas ciegas o con baja visión.', hp: 'Mejor con auriculares', menu: 'Menú',
    choose: '¿Cómo quieres explorar?', mListen: 'Escucho', mListenSub: 'Para personas ciegas o con baja visión. Todo se lee en voz alta y se explica antes de sonar.', mWatch: 'Miro', mWatchSub: 'Para personas sordas o con pérdida auditiva. Un mapa silencioso con subtítulos para cada nota.', mBoth: 'Escucha y mira', mBothSub: 'Sonido e imagen juntos, con una guía breve.', a11y: 'Ajustes de accesibilidad',
    howTo: 'Cómo escuchar', startMusic: 'Empezar la música', guideNote: 'Puedes desactivar esta guía en los ajustes de escucha.',
    'tour': 'Escucha las cinco en 60 s', 'tourStop': 'Detener el recorrido', 'tourStep': 'Recorrido', 'nar.ocean': 'Soy el océano. Mi agua cálida canta agudo; mi agua fría, grave.', 'nar.nightlights': 'Somos las luces de tus ciudades. Escucha cómo crecemos de 2012 a 2023.', 'nar.lightning': 'Soy el rayo. Cada golpe de tambor es una tormenta en algún lugar de la Tierra.', 'nar.co2': 'Soy el dióxido de carbono. Escucha cómo el acorde tranquilo se tensa a medida que me extiendo.', 'nar.caspian': 'Soy Azerbaiyán, de Najichevan a Bakú. Cada compás es una década: escucha cómo se calienta cada ciudad.',
    cta: 'Escucha la Tierra', back: 'Volver al mapa', visual: 'Explorar sin sonido',
    why: 'Una rocola que convierte las imágenes de la Tierra de la NASA en música, para que cualquiera, incluidas las personas ciegas, pueda explorar nuestro planeta cambiante con el oído.',
    s1b: '1 · Imágenes de la NASA', s1: 'Animaciones reales de la NASA: temperatura del océano, luces nocturnas, rayos, CO₂ y nuestra región.',
    s2b: '2 · Los colores se vuelven números', s2: 'La aplicación lee el color de cada píxel y lo convierte de nuevo en el dato que representa.',
    s3b: '3 · Los números se vuelven música', s3: 'Un valor alto suena como una nota aguda. El oeste suena en el oído izquierdo y el este en el derecho. El silencio significa que no hay datos.',
    sub: 'Se recomiendan auriculares · Cada escena empieza tocando su nota más grave y más aguda',
    about: '¿Qué es esto?', settings: 'Ajustes de escucha', keys: 'Teclado',
    play: 'Reproducir', pause: 'Pausa', again: 'Volver a reproducir', touch: 'Escuchar al tocar', describe: 'Describir',
    read: 'Cómo leer esta escena', hear: '¿Qué estoy oyendo?', data: 'Datos de la NASA', sound: 'Sonido', meaning: 'Significado', limits: 'Límites',
    aboutTitle: 'Sobre el proyecto', lang: 'Idioma',
    'listen.ocean': 'Nota aguda = agua cálida · nota grave = agua fría · golpe suave = tierra · oído izquierdo = oeste',
    'listen.nightlights': 'Campana más fuerte y aguda = ciudad más brillante · el bordón sube cuando el mundo brilla más · oído izquierdo = América',
    'listen.lightning': 'Cada golpe de tambor = un rayo · retumbo grave = tormenta tropical · tambor más agudo = lejos del ecuador',
    'listen.co2': 'Nota más aguda = más CO₂ · el acorde vibra y late cuando sube el CO₂ · rumor = cuánta área cubre',
    'listen.caspian': 'Una nota = una ciudad, de oeste a este · cada compás = una década · más agudo = más cálido que en los 80',
  },
  ru: {
    theme: 'Слушать нашу тему', themeStop: 'Остановить тему', themeBy: 'Оригинальная музыка нашего участника команды',
    failStart: 'Не удалось включить звук на этом устройстве. Нажмите ещё раз или выберите «Исследовать без звука».', tapAgain: 'Нажмите ещё раз, чтобы включить звук. На iPhone также проверьте бесшумный режим и громкость.',
    legend1: 'Звуковая легенда · 1 из 2', legend2: 'Звуковая легенда · 2 из 2', lowest: 'Самая низкая нота', highest: 'Самая высокая нота', means: 'означает', now: 'Теперь слушайте', sweep: 'Развёртка идёт с запада на восток', loading: 'Загрузка звуков…',
    q: 'Карты NASA о нашей меняющейся планете говорят только с глазами. Polyphonic Earth превращает их в музыку, которую может услышать каждый, в том числе незрячие и слабовидящие люди.', hp: 'Лучше в наушниках', menu: 'Меню',
    choose: 'Как вы хотите исследовать?', mListen: 'Я слушаю', mListenSub: 'Для незрячих и слабовидящих. Всё зачитывается вслух и объясняется до того, как зазвучит.', mWatch: 'Я смотрю', mWatchSub: 'Для глухих и слабослышащих. Беззвучная карта с субтитрами к каждой ноте.', mBoth: 'Слушать и смотреть', mBothSub: 'Звук и изображение вместе, с коротким гидом.', a11y: 'Настройки доступности',
    howTo: 'Как слушать', startMusic: 'Запустить музыку', guideNote: 'Этот гид можно отключить в настройках прослушивания.',
    'tour': 'Все пять за 60 секунд', 'tourStop': 'Остановить тур', 'tourStep': 'Тур', 'nar.ocean': 'Я — океан. Моя тёплая вода звучит высоко, холодная — низко.', 'nar.nightlights': 'Мы — огни ваших городов. Послушайте, как мы растём с 2012 по 2023 год.', 'nar.lightning': 'Я — молния. Каждый удар барабана — гроза где-то на Земле.', 'nar.co2': 'Я — углекислый газ. Услышьте, как спокойный аккорд становится напряжённым, когда я распространяюсь.', 'nar.caspian': 'Я — Азербайджан, от Нахчывана до Баку. Каждый такт — десятилетие: услышьте, как теплеет каждый город.',
    cta: 'Слушать Землю', back: 'Вернуться к карте', visual: 'Исследовать без звука',
    why: 'Музыкальный автомат, который превращает снимки Земли NASA в музыку, чтобы каждый, в том числе незрячие люди, мог исследовать меняющуюся планету на слух.',
    s1b: '1 · Снимки NASA', s1: 'Настоящие анимации NASA: температура океана, ночные огни, молнии, CO₂ и наш родной регион.',
    s2b: '2 · Цвета становятся числами', s2: 'Приложение читает цвет каждого пикселя и превращает его обратно в данные.',
    s3b: '3 · Числа становятся музыкой', s3: 'Высокое значение звучит высокой нотой. Запад звучит в левом ухе, восток в правом. Тишина означает отсутствие данных.',
    sub: 'Рекомендуются наушники · Каждая сцена начинается с самой низкой и самой высокой ноты',
    about: 'Что это?', settings: 'Настройки прослушивания', keys: 'Клавиатура',
    play: 'Играть', pause: 'Пауза', again: 'Играть снова', touch: 'Слушать касанием', describe: 'Описать',
    read: 'Как читать эту сцену', hear: 'Что я слышу?', data: 'Данные NASA', sound: 'Звук', meaning: 'Смысл', limits: 'Ограничения',
    aboutTitle: 'О проекте', lang: 'Язык',
    'listen.ocean': 'Высокая нота = тёплая вода · низкая нота = холодная вода · мягкий стук = суша · левое ухо = запад',
    'listen.nightlights': 'Громче и выше колокол = ярче город · гул растёт, когда мир становится ярче · левое ухо = Америка',
    'listen.lightning': 'Каждый удар барабана = молния · глубокий гул = тропическая гроза · выше барабан = дальше от экватора',
    'listen.co2': 'Выше нота = больше CO₂ · аккорд дрожит и бьётся, когда растёт CO₂ · гул = площадь покрытия',
    'listen.caspian': 'Одна нота = один город, с запада на восток · такт = десятилетие · выше = теплее, чем в 1980-х',
  },
};

let current = 'en';
export const getLang = () => current;
export function setLang(l) { current = S[l] ? l : 'en'; }
export const t = (key) => S[current][key] ?? S.en[key] ?? key;

/** Fill every element marked data-i18n with the current language. */
export function applyI18n(root = document) {
  document.documentElement.lang = current;
  root.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
}
