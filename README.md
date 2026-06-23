### Работа с приложением

#### Зависимости

- [Node JS](https://nodejs.org/en/download) (от 22 версии)
- [Пакетный менеджер pnpm](https://pnpm.io/ru/installation)

#### Локальная разработка

```bash
pnpm install # установка библиотек
pnpm husky init # добавление git-hooks
pnpm run dev # запуск тестового веб-версера
```

#### Тестирование

```bash
pnpm exec playwright install chrome 
# установка браузера для тестирования
pnpm run test # запуск тестов
```


#### Развертка в продакшен

1. Собирите проект
```bash
pnpm install # установка библиотек
pnpm run build # сборка проекта
```

2. Настройте веб-сервер (например Nginx) на выдачу файлов из папки `/dist`.