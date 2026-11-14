// Interface languages: English, Azerbaijani, Spanish, Russian.
// Scientific detail panels stay in English for accuracy; everything a first-time visitor
// needs to start, play, explore and understand each scene is translated.

export const LANGS = { en: 'English', az: 'Azərbaycanca', es: 'Español', ru: 'Русский' };

const S = {
  en: {
    theme: 'Play our theme song', themeStop: 'Stop the theme song', themeBy: 'Original music by our teammate',
    failStart: 'Sound could not start on this device. Tap play again, or choose Explore without sound below.', tapAgain: 'Tap play once more to turn the sound on. On iPhone, also check the silent switch and volume.',
    legend1: 'Sound legend · 1 of 2', legend2: 'Sound legend · 2 of 2', lowest: 'Lowest note', highest: 'Highest note', means: 'means', now: 'Now listen', sweep: 'The sweep plays west → east', loading: 'Loading sounds…',
    q: 'What if you could hear our planet changing?',
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
    'listen.caspian': 'One note = one year in Mingachevir · higher = warmer · the low drone is the 1980s average',
  },
  az: {
    theme: 'Mövzu mahnımızı dinlə', themeStop: 'Mövzu mahnısını dayandır', themeBy: 'Komanda üzvümüzün orijinal bəstəsi:',
    failStart: 'Bu cihazda səs başlaya bilmədi. Yenidən toxunun və ya aşağıda “Səssiz kəşf et” seçin.', tapAgain: 'Səsi açmaq üçün bir dəfə də toxunun. iPhone-da səssiz rejim düyməsini və səs səviyyəsini də yoxlayın.',
    legend1: 'Səs açarı · 1/2', legend2: 'Səs açarı · 2/2', lowest: 'Ən aşağı nota', highest: 'Ən yüksək nota', means: 'deməkdir:', now: 'İndi dinləyin', sweep: 'Tarama qərbdən şərqə gedir', loading: 'Səslər yüklənir…',
    q: 'Planetimizin dəyişməsini eşidə bilsəydiniz?',
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
    'listen.caspian': 'Bir nota = Mingəçevirdə bir il · yüksək = daha isti · alçaq dron 1980-ci illərin ortalamasıdır',
  },
  es: {
    theme: 'Escucha nuestro tema', themeStop: 'Detener el tema', themeBy: 'Música original de nuestro compañero',
    failStart: 'El sonido no pudo iniciarse en este dispositivo. Toca de nuevo o elige “Explorar sin sonido”.', tapAgain: 'Toca una vez más para activar el sonido. En iPhone, revisa también el interruptor de silencio y el volumen.',
    legend1: 'Leyenda sonora · 1 de 2', legend2: 'Leyenda sonora · 2 de 2', lowest: 'Nota más grave', highest: 'Nota más aguda', means: 'significa', now: 'Ahora escucha', sweep: 'El barrido va de oeste a este', loading: 'Cargando sonidos…',
    q: '¿Y si pudieras oír cómo cambia nuestro planeta?',
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
    'listen.caspian': 'Una nota = un año en Mingachevir · más aguda = más cálido · el bordón grave es el promedio de los años 80',
  },
  ru: {
    theme: 'Слушать нашу тему', themeStop: 'Остановить тему', themeBy: 'Оригинальная музыка нашего участника команды',
    failStart: 'Не удалось включить звук на этом устройстве. Нажмите ещё раз или выберите «Исследовать без звука».', tapAgain: 'Нажмите ещё раз, чтобы включить звук. На iPhone также проверьте бесшумный режим и громкость.',
    legend1: 'Звуковая легенда · 1 из 2', legend2: 'Звуковая легенда · 2 из 2', lowest: 'Самая низкая нота', highest: 'Самая высокая нота', means: 'означает', now: 'Теперь слушайте', sweep: 'Развёртка идёт с запада на восток', loading: 'Загрузка звуков…',
    q: 'А что, если бы вы могли услышать, как меняется наша планета?',
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
    'listen.caspian': 'Одна нота = один год в Мингячевире · выше = теплее · низкий гул = среднее за 1980-е',
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
