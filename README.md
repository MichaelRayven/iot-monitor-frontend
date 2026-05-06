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

Dialogs:
- Update floor
   - Should have image upload and preview
   - Scale factor (to translate pixels to real coordinates in meters)
   - List of devices on the floor
   - Ability to add devices from a global list of registered devices (a popup list)
   - Ability to remove devices from this floor (should ask confirmation)
- Add device dialog
   - Devices have the following fields: names, devEui (ids), rssi (signal strength), snr (signal-noise-ratio), type (the user should manually set this via dropdown), stationary (whether to draw the device on the floor plan), x and y coordinates (if stationary)
  

  ### TODO:
  1. Диалог создания устройства
   - Название (по умолчанию с сервера)
   - ID (неизменяемое)
   - RSSI (неизменяемое)
   - SNR (неизменяемое)
   - Статус (неизменяемое)
   - Стационарное
   - x
   - y
   - Блокировка перемещений (делает координаты неизменяемыми)


  2. Диалог создания этажа
   - Название
   - Изображение этажа
   - Маштаб (рисуем сетку поверх изображения)
   - 

  3. Диалог создания здания

