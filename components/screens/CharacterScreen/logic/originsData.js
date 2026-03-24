// originsData.js
export const ORIGINS = [
  {
    id: 1,
    name: "Братство Стали",
    image: require('../../../../assets/origins/brotherhood_of_steel.png'),
    equipmentKits: [
      {
        name: 'Комплект Посвященного',
        clothing: [
          { type: 'fixed', name: 'Униформа Братства Стали' },
        ],
        armor: [
        { type: 'fixed', name: 'Капюшон Братства Стали' },
        ],
        weapons: [
          { type: 'fixed', weaponId: 'weapon_029' },
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_018', ammunition: '10+5fn{CD}<ammo>' },
              { weaponId: 'weapon_002', ammunition: '10+5fn{CD}<ammo>' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Голографические жетоны' }
        ]
      },
      {
        name: 'Комплект Писца',
        clothing: [
          { type: 'fixed', name: 'Доспехи писца Братства' },
        ],
        armor: [
          { type: 'fixed', name: 'Шляпа писца' },
        ],
        weapons: [
          { type: 'fixed', weaponId: 'weapon_029' },
          { 
            type: 'choice',
            options: [
              { weaponId: 'weapon_018', ammunition: '6+3fn{CD}<ammo>' },
              { weaponId: 'weapon_002', ammunition: '6+3fn{CD}<ammo>' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Голографические жетоны' }
        ]
      }
    ],
  },
  {
    id: 2,
    name: "Житель НКР",
    image: require('../../../../assets/origins/ncr_citizen.png'),
    equipmentKits: [
      {
        name: 'Пехотинец',
        clothing: [
          { type: 'fixed', name: 'Военная форма' }
        ],
        armor: [
          { type: 'fixed', name: 'Армейский шлем' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_005', ammunition: '8+4fn{CD}<ammo>' },
              { weaponId: 'weapon_009', ammunition: '6+3fn{CD}<ammo>' }
            ]
          },
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_002', ammunition: '8+4fn{CD}<ammo>' },
              { weaponId: 'weapon_029' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'Очищенная вода', itemType: 'chem' },
          { type: 'fixed', name: '(5+(5<cd>))<нкр>' }
        ]
      },
      {
        name: 'Багровый караванщик',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        armor: [
          {
            type: 'choice',
            options: [
              { name: 'Кожаный Нагрудник' },
              {
                group: [
                  { type: 'fixed', name: 'Кожаный Наруч' },
                  { type: 'fixed', name: 'Кожаный Понож' }
                ]
              }
            ]
          }
        ],
        weapons: [
          { type: 'fixed', weaponId: 'weapon_010', ammunition: '6+3fn{CD}<ammo>' },
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_029' },
              {
                group: [
                  { type: 'fixed', weaponId: 'weapon_048' },
                  { type: 'fixed', weaponId: 'weapon_048' }
                ]
              }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Вьючный брамин' },
          { type: 'fixed', name: 'd20<trinklet>' },
          // Для совместимости без изменения логики RandomLootLogic.js —
          // раскладываем в три и два независимых броска соответственно
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<brewery>' },
          { type: 'fixed', name: 'd20<brewery>' },
          { type: 'fixed', name: 'колода карт' },
          { type: 'fixed', name: '2d20<нкр>' }
        ]
      },
      {
        name: 'Меткий стрелок',
        clothing: [
          { type: 'fixed', name: 'Военная форма' }
        ],
        armor: [
          { type: 'fixed', name: 'Армейский шлем' }
        ],
        weapons: [
          { type: 'fixed', weaponId: 'weapon_007', modIds: ['mod_005', 'mod_035'], ammunition: '6+3fn{CD}<ammo>' }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Спокойствие', itemType: 'chem' },
          { type: 'fixed', name: 'Руководство по Тайным Операции США' }
        ]
      }
    ],
  },
  {
    id: 3,
    name: "Минитмен",
    image: require('../../../../assets/origins/minuteman.png'),
    equipmentKits: [
      {
        name: 'Стрелок',
        clothing: [
          { type: 'fixed', name: 'Повседневная одежда' },
          { type: 'fixed', name: 'Обычная шляпа' }
        ],
        armor: [
          {
            type: 'choice',
            options: [
              { name: 'Кожаный Нагрудник' },
              { name: 'Кожаный Наруч' }
            ]
          }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_017', ammunition: '14+7fn{CD}<ammo>' },
              { weaponId: 'weapon_007', ammunition: '6+3fn{CD}<ammo>' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: '2d20<food>' },
          { type: 'fixed', name: '2d20<food>' },
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '5<caps>' }
        ]
      },
      {
        name: 'Застрельщик',
        clothing: [
          { type: 'fixed', name: 'Повседневная одежда' }
        ],
        armor: [
          { type: 'fixed', name: 'Армейский шлем' },
          { type: 'fixed', name: 'Металлический Нагрудник' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_010', ammunition: '6+3fn{CD}<ammo>' },
              { weaponId: 'weapon_008', ammunition: '8+4fn{CD}<ammo>' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<chem>', itemType: 'chem' },
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '5<caps>' }
        ]
      }
    ],
  },
  {
  id: 4,
  name: "Дитя Атома",
  image: require('../../../../assets/origins/child_of_atom.png'),
  description: "Поклонники атомной энергии",
  equipmentKits: [
    {
      name: 'Миссионер',
      clothing: [
        { type: 'fixed', name: 'Прочная одежда' }
      ],
      weapons: [
        { type: 'fixed', weaponId: 'weapon_045' },
        { type: 'fixed', weaponId: 'weapon_020', ammunition: '4+2fn{CD}<ammo>' }
      ],
      miscellaneous: [
        { type: 'fixed', name: 'Стим-пак', itemType: 'chem' },
        { type: 'fixed', name: '10<caps>' },
        { type: 'fixed', name: 'd20<food>' }
      ]
    },
    {
      name: 'Зилот',
      clothing: [
        { 
          type: 'choice',
          options: [
            { name: 'Прочная одежда' },
            { name: 'Костюм бродяги' }
          ]
        }
      ],
      armor: [
        { type: 'fixed', name: 'Противогаз' }
      ],
      weapons: [
        { type: 'fixed', weaponId: 'weapon_030' },
        { type: 'fixed', weaponId: 'weapon_020', ammunition: '4+2fn{CD}<ammo>' }
      ],
      miscellaneous: [
        { type: 'fixed', name: 'd20<food>' },
        { type: 'fixed', name: 'd20<food>' }
      ]
    }
  ]
},
  {
    id: 5,
    name: "Обитатель убежища",
    image: require('../../../../assets/origins/vault_dweller.png'),
    description: "Жители подземных убежищ",
  },
  {
    id: 6,
    name: "Протектрон",
    image: require('../../../../assets/origins/protectron.png'),
    description: "Старые роботы-охранники",
  },
  {
    id: 7,
    name: "Выживший",
    image: require('../../../../assets/origins/survivor.png'),
    description: "Одиночки, выжившие в пустошах",
    equipmentKits: [
      {
        name: 'Наемник',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        armor: [
          { 
            type: 'choice',
            options: [
              { name: 'Кожаный Нагрудник' },
              { 
                group: [
                  { type: 'fixed', name: 'Кожаный Наруч' },
                  { type: 'fixed', name: 'Кожаный Понож' },
                ]
              }
            ]
          }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_034' },
              { weaponId: 'weapon_044' }
            ]
          },
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_002', ammunition: '10+5fn{CD}<ammo>' },
              { weaponId: 'weapon_001', ammunition: '10+5fn{CD}<ammo>' },
              { weaponId: 'weapon_007', ammunition: '10+5fn{CD}<ammo>' },
              { weaponId: 'weapon_012', ammunition: '10+5fn{CD}<ammo>' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Объявление о работе в соседнем поселении с наградой в 50 крышек' },
          { type: 'fixed', name: '15<caps>' }
        ]
      },
      {
        name: 'Поселенец',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_033' },
              { weaponId: 'weapon_038' },
              { weaponId: 'weapon_040' },
              { weaponId: 'weapon_048' }
            ]
          },
          { 
            type: 'fixed', 
            weaponId: 'weapon_012', 
            ammunition: '6+3fn{CD}<ammo>' 
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '45<caps>' }
        ]
      },
      {
        name: 'Путешественник',
        clothing: [
          { type: 'fixed', name: 'Костюм бродяги' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_033' },
              { weaponId: 'weapon_038' },
              { weaponId: 'weapon_040' },
              { weaponId: 'weapon_048' }
            ]
          },
          { 
            type: 'fixed', 
            weaponId: 'weapon_012', 
            ammunition: '8+4fn{CD}<ammo>' 
          }
        ],
        miscellaneous: [
          { 
            type: 'choice',
            options: [
              { name: 'Винт', itemType: 'chem' },
              { name: 'Антирадин', itemType: 'chem' }
            ]
          },
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '30<caps>' }
        ]
      },
      {
        name: 'Рейдер',
        clothing: [
          { type: 'fixed', name: 'Панталоны' }
        ],
        armor: [
          { type: 'fixed', name: 'Рейдерский Нагрудник' },
          { type: 'fixed', name: 'Рейдерский Наруч' }
        ],
        weapons: [
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_037' },
              { weaponId: 'weapon_039' },
              { weaponId: 'weapon_044' }
            ]
          },
          { 
            type: 'fixed', 
            weaponId: 'weapon_012', 
            ammunition: '10+5fn{CD}<ammo>' 
          }
        ],
        miscellaneous: [
          { 
            type: 'choice',
            options: [
              { name: 'Винт', itemType: 'chem' },
              { name: 'Антирадин', itemType: 'chem' }
            ]
          },
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_055' },
              { name: 'Стим-пак', itemType: 'chem' }
            ]
          },
          { type: 'fixed', name: '15<caps>' }
        ]
      },
      {
        name: 'Торговец',
        clothing: [
          { type: 'fixed', name: 'Прочная одежда' }
        ],
        armor: [
          { 
            type: 'choice',
            options: [
              { name: 'Кожаный Нагрудник' },
              { 
                group: [
                  { name: 'Кожаный Наруч' },
                  { name: 'Кожаный Понож' }
                ]
              }
            ]
          }
        ],
        weapons: [
          { 
            type: 'fixed', 
            weaponId: 'weapon_012', 
            ammunition: '8+4fn{CD}<ammo>' 
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '3 броска по таблицам добычи' },
          { type: 'fixed', name: 'Вьючный брамин' },
          { type: 'fixed', name: '50<caps>' }
        ]
      }
    ],
  },
  {
    id: 8,
    name: "Секьюритрон",
    image: require('../../../../assets/origins/securitron.png'),
    description: "Боевые роботы с продвинутым вооружением",
  },
{
  id: 9,
  name: "Гуль",
  image: require('../../../../assets/origins/ghoul.png'),
  description: "Мутанты, устойчивые к радиации",
  equipmentKits: [
    {
      name: 'Наемник',
      clothing: [
        { type: 'fixed', name: 'Прочная одежда' }
      ],
      armor: [
        { 
          type: 'choice',
          options: [
            { name: 'Кожаный Нагрудник' },
            { 
              group: [
                { type: 'fixed', name: 'Кожаный Наруч' },
                { type: 'fixed', name: 'Кожаный Понож' },
              ]
            }
          ]
        }
      ],
      weapons: [
        {
          type: 'choice',
          options: [
            { weaponId: 'weapon_034' },
            { weaponId: 'weapon_044' }
          ]
        },
        {
          type: 'choice',
          options: [
            { weaponId: 'weapon_002', ammunition: '10+5fn{CD}<ammo>' },
            { weaponId: 'weapon_001', ammunition: '10+5fn{CD}<ammo>' },
            { weaponId: 'weapon_007', ammunition: '10+5fn{CD}<ammo>' },
            { weaponId: 'weapon_012', ammunition: '10+5fn{CD}<ammo>' }
          ]
        }
      ],
      miscellaneous: [
        { type: 'fixed', name: 'Объявление о работе в соседнем поселении с наградой в 50 крышек' },
        { type: 'fixed', name: '15<caps>' }
      ]
    },
    {
      name: 'Поселенец',
      clothing: [
        { type: 'fixed', name: 'Прочная одежда' }
      ],
      weapons: [
        {
          type: 'choice',
          options: [
            { weaponId: 'weapon_033' },
            { weaponId: 'weapon_038' },
            { weaponId: 'weapon_040' },
            { weaponId: 'weapon_048' }
          ]
        },
        { 
          type: 'fixed', 
          weaponId: 'weapon_012', 
          ammunition: '6+3fn{CD}<ammo>' 
        }
      ],
      miscellaneous: [
        { type: 'fixed', name: 'd20<food>' },
        { type: 'fixed', name: 'd20<food>' },
        { type: 'fixed', name: 'd20<trinklet>' },
        { type: 'fixed', name: '45<caps>' }
      ]
    },
    {
      name: 'Путешественник',
      clothing: [
        { type: 'fixed', name: 'Костюм бродяги' }
      ],
      weapons: [
        {
          type: 'choice',
          options: [
            { weaponId: 'weapon_033' },
            { weaponId: 'weapon_038' },
            { weaponId: 'weapon_040' },
            { weaponId: 'weapon_048' }
          ]
        },
        { 
          type: 'fixed', 
          weaponId: 'weapon_012', 
          ammunition: '8+4fn{CD}<ammo>' 
        }
      ],
      miscellaneous: [
        { 
          type: 'choice',
          options: [
            { name: 'Винт', itemType: 'chem' },
            { name: 'Антирадин', itemType: 'chem' }
          ]
        },
        { type: 'fixed', name: 'd20<trinklet>' },
        { type: 'fixed', name: '30<caps>' }
      ]
    },
    {
      name: 'Рейдер',
      clothing: [
        { type: 'fixed', name: 'Панталоны' }
      ],
      armor: [
        { type: 'fixed', name: 'Рейдерский Нагрудник' },
        { type: 'fixed', name: 'Рейдерский Наруч' }
      ],
      weapons: [
        {
          type: 'choice',
          options: [
            { weaponId: 'weapon_037' },
            { weaponId: 'weapon_039' },
            { weaponId: 'weapon_044' }
          ]
        },
        { 
          type: 'fixed', 
          weaponId: 'weapon_012', 
          ammunition: '10+5fn{CD}<ammo>' 
        }
      ],
      miscellaneous: [
        { 
          type: 'choice',
          options: [
            { name: 'Винт', itemType: 'chem' },
            { name: 'Антирадин', itemType: 'chem' }
          ]
        },
        {
          type: 'choice',
          options: [
            { weaponId: 'weapon_055' },
            { name: 'Стим-пак', itemType: 'chem' }
          ]
        },
        { type: 'fixed', name: '15<caps>' }
      ]
    },
    {
      name: 'Торговец',
      clothing: [
        { type: 'fixed', name: 'Прочная одежда' }
      ],
      armor: [
        { 
          type: 'choice',
          options: [
            { name: 'Кожаный Нагрудник' },
            { 
              group: [
                { name: 'Кожаный Наруч' },
                { name: 'Кожаный Понож' }
              ]
            }
          ]
        }
      ],
      weapons: [
        { 
          type: 'fixed', 
          weaponId: 'weapon_012', 
          ammunition: '8+4fn{CD}<ammo>' 
        }
      ],
      miscellaneous: [
        { type: 'fixed', name: 'd20<trinklet>' },
        { type: 'fixed', name: '3 броска по таблицам добычи' },
        { type: 'fixed', name: 'Вьючный брамин' },
        { type: 'fixed', name: '50<caps>' }
      ]
    }
  ]
},
  {
    id: 10,
    name: "Штурмотрон",
    image: require('../../../../assets/origins/assaultron.png'),
    description: "Элитные боевые роботы с ближним боем",
  },
  {
    id: 11,
    name: "Супермутант",
    image: require('../../../../assets/origins/super_mutant.png'),
    description: "Мощные мутанты с огромной силой",
    equipmentKits: [
      {
        name: "Громила",
        armor: [
          { type: 'fixed', name: 'Рейдерский Нагрудник' },
          {
            type: 'choice',
            options: [
              { name: 'Рейдерский Наруч' },
              { name: 'Рейдерский Понож' }
            ]
          }
        ],
        weapons: [
          { 
            type: 'fixed', 
            weaponId: 'weapon_012', 
            ammunition: '6+3fn{CD}<ammo>' 
          },
          {
            type: 'choice',
            options: [
              { weaponId: 'weapon_034' },
              { weaponId: 'weapon_030' }
            ]
          }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '5<caps>' }
        ]
      },
      {
        name: "Застрельщик",
        armor: [
          { type: 'fixed', name: 'Рейдерский Нагрудник' },
          {
            type: 'choice',
            options: [
              { name: 'Рейдерский Наруч' },
              { name: 'Рейдерский Понож' }
            ]
          }
        ],
        weapons: [
          { 
            type: 'fixed', 
            weaponId: 'weapon_011', 
            modIds: ['mod_005'],
            ammunition: '8+4fn{CD}<ammo>' 
          },
          { type: 'fixed', weaponId: 'weapon_036' }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<trinklet>' },
          { type: 'fixed', name: '5<caps>' }
        ]
      }
    ],
  },
  {
    id: 12,
    name: "Мистер Помощник",
    image: require('../../../../assets/origins/mister_handy.png'),
    description: "Универсальные сервисные роботы",
  },
  {
    id: 13,
    name: "Изгой Братства Стали",
    image: require('../../../../assets/origins/brotherhood_outcast.png'),
    description: "Отвергнутые члены Братства",
    equipmentKits: [
      {
        name: 'Бывший рыцарь',
        clothing: [
          { type: 'fixed', name: 'Униформа Братства Стали' },
          { type: 'fixed', name: 'Очищенная вода', itemType: 'chem' }
        ],
        weapons: [
          { type: 'fixed', weaponId: 'weapon_017', ammunition: '8+6fn{CD}<ammo>' }
        ],
        loot: [
          { type: 'fixed', name: 'd20<outcast>' },
          { type: 'fixed', name: 'd20<outcast>' }
        ],
        miscellaneous: [
          { type: 'fixed', name: '10<caps>' }
        ]
      },
      {
        name: 'Бывший писец',
        armor: [
          { type: 'fixed', name: 'Поношенная броня писца Братства' }
        ],
        weapons: [
          { type: 'fixed', weaponId: 'weapon_018', ammunition: '8+4fn{CD}<ammo>' }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'Мультитул' }
        ],
        loot: [
          { type: 'fixed', name: 'd20<outcast>' },
          { type: 'fixed', name: 'd20<outcast>' },
          { type: 'fixed', name: 'd20<outcast>' },
          { type: 'fixed', name: '15<caps>' }
        ]
      }
    ],
  },
  {
    id: 14,
    name: "Тень",
    image: require('../../../../assets/origins/shadow.png'),
    description: "Таинственные агенты подполья",
  },
  {
    id: 15,
    name: "Синт",
    image: require('../../../../assets/origins/synth.png'),
    description: "Продвинутые андроиды",
  },
  {
    id: 16,
    name: "Робомозг",
    image: require('../../../../assets/origins/robobrain.png'),
    description: "Роботы с человеческим мозгом",
    immunity: {
      radiation: true,
      poison: true
    },
    equipmentKits: [
      {
        name: 'Гипнотрон',
        weapons: [
          { type: 'fixed', weaponId: 'weapon_067', ammunition: '10+5fn{CD}<ammo>' }
        ],
        miscellaneous: [
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<food>' },
          { type: 'fixed', name: 'd20<trinklet>' }
        ]
      }
    ]
  },
  {
    id: 17,
    name: "Дикарь",
    image: require('../../../../assets/origins/savage.png'),
    description: "Племенные жители пустошей",
  }
];