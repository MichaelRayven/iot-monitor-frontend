Install pnpm
pnpm install
pnpm husky init
pnpm exec playwright install

I need a clean and practical design, with branch color accents. The app is a monitoring dashboard for IoT devices in industrial complexes, the focal point of the app is an interactive floor map which shows device locations and states. The idea is that device data will update in realtime via websockets (but thats not our concern). 

Multiple screens:
- Login screen
- Dashboard screen
   - Includes a map with devices displayed on top, devices are clickable (shows current state in sidebar on the right) and draggable (changes device position), lock/unlock button for position.
   - Floor selector (dropdown)
   - Add floor button
   - Delete floor button (should ask confirmation)
   - Update floor button


### TODO:
- [x] Диалог добавления устройства на этаж
- [ ] Переключатель блокировка перемещений
- [ ] Отображение данных с устройства
- [ ] Редактирование устройств этажа
- [ ] Удаление устройств с этажа
- [ ] Зум относительно позиции курсора
- [x] Диалог создания здания
- [x] Диалог создания этажа
- [x] Переехать с prettier на biome 
