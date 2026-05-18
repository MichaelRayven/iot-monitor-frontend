export const getSmartBadgeReason = (reason?: number) => {
  switch (reason) {
    case 0:
      return "По времени";
    case 1:
      return "Обнаружено движение";
    case 2:
      return "Движение прекращено";
    case 3:
      return "Обнаружен отрыв";
    case 4:
      return "Обнаружен удар";
    case 5:
      return "Активированна тревога (поиск)";
    case 6:
      return "Активированна тревога (потеря СИЗ)";
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
    default:
      return "Ожидание";
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
      return "Ожидание";
  }
};

export const getSmartMS0101Reason = (reason?: number) => {
  switch (reason) {
    case 1:
      return "Замечено движение";
    default:
      return "Ожидание";
  }
};

export const getSmartMS0101State = (state?: string) => {
  if (state === "Guard") return "Охрана";
  if (state === "Neutral") return "Нейтральный";
  return undefined;
};
