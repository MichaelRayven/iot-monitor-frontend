export const getSmartBadgeReason = (reason?: number) => {
  switch (reason) {
    case 0:
      return "По времени";
    case 1:
      return "По началу движения";
    case 2:
      return "По прекращению движения";
    case 3:
      return "По датчику отрыва";
    case 4:
      return "По обнаружению падения (удар)";
    case 5:
      return "По активации тревоги (поиск)";
    case 6:
      return "По активации тревоги (потеря СИЗ)";
    default:
      return undefined;
  }
};

export const getSmartBadgeStatus = (status?: number) => {
  switch (status) {
    case 1:
      return "Вызов";
    case 2:
      return "Предупреждение";
    case 3:
      return "Поиск";
    // omitting 0 and 7 per requirements as they are normal/clear states
    default:
      return undefined;
  }
};

export const getSmartWB0101Mode = (mode?: number) => {
  switch (mode) {
    case 2:
    case 3:
      return "Тревога";
    case 5:
      return "Тревога принята";
    case 6:
      return "Тестирование";
    default:
      return undefined; // Omitting "Ожидание" and "Отмена тревоги" to reduce noise
  }
};

export const getSmartMS0101Reason = (reason?: number) => {
  switch (reason) {
    case 1:
      return "Тревога";
    default:
      return undefined; // Omitting 0 and 2 for a cleaner current status
  }
};

export const getSmartMS0101State = (state?: string) => {
  if (state === "Guard") return "Охрана";
  if (state === "Neutral") return "Нейтральный";
  return undefined;
};
