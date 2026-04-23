// Тестовый файл для проверки работы утилит модификаций
import { 
  declinePrefix, 
  getModifiedWeaponName, 
  applyModification,
  applyMultipleModifications,
  getAvailableModifications 
} from '../../../domain/modsEquip';

// Тестовые данные
const testWeapon = {
  "Название": "10-мм Пистолет",
  "Урон": 4,
  "Эффекты": "–",
  "Тип урона": "Физический",
  "Скорость стрельбы": 2,
  "Качества": "Вплотную, Надёжный",
  "Вес": 4,
  "Цена": 50,
  "Редкость": 1,
  "itemType": "weapon",
  "Патроны": "10-мм",
  "Модификации": {
    "Ресивер": ["Калиброванный", "Укреплённый", "Для автоогня", "Чувствительный", "Усиленный", "Продвинутый"],
    "Ствол": ["Длинный", "Перфорированный"],
    "Рукоять": ["Удобная", "Тактическая"],
    "Магазин": ["Большой", "Быстросъемный", "Большой быстросъемный"],
    "Прицел": ["Коллиматорный", "Прицел разведчика"],
    "Дуло": ["Компенсатор", "Глушитель"]
  }
};

const testModification = {
  "Префикс имени": "Автоматический",
  "Эффекты": "-1 урона, +2 Скорострельность",
  "Вес": 1,
  "Цена": 30,
  "Перки": ["Фанатик оружия 1"]
};

// Тестовые множественные модификации
const testModifications = [
  {
    "Префикс имени": "Усиленный",
    "Эффекты": "+2 урона",
    "Вес": 1,
    "Цена": 25,
    "Перки": ["Фанатик оружия 1"]
  },
  {
    "Префикс имени": "Длинный",
    "Эффекты": "Увеличение дистанции на 1 зону",
    "Вес": 1,
    "Цена": 20,
    "Перки": ["Фанатик оружия 1"]
  },
  {
    "Префикс имени": "Разведывательный",
    "Эффекты": "Добавляет 'Точное', Добавляет 'Разведывательный'",
    "Вес": 1,
    "Цена": 59,
    "Перки": ["Наука! 3"]
  }
];

// Выполняем тесты и экспортируем результаты
const modifiedWeapon = applyModification(testWeapon, testModification);
const modifications = [testModification];
const modifiedName = getModifiedWeaponName(testWeapon, modifications);

// Тест множественных модификаций
const multipleModifiedWeapon = applyMultipleModifications(testWeapon, testModifications);
const multipleModifiedName = getModifiedWeaponName(testWeapon, testModifications);

export { 
  testWeapon, 
  testModification, 
  testModifications,
  modifiedWeapon, 
  modifiedName,
  multipleModifiedWeapon,
  multipleModifiedName
}; 