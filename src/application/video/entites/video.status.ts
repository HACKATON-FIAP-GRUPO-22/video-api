export enum VideoStatus {
  Pending = 'pendente',
  InProgress = 'em processamento',
  Ready = 'pronto',
  error = 'erro',
}

export const getEnumFromString = (value: string): VideoStatus | undefined => {
  if (Object.values(VideoStatus).includes(value as VideoStatus)) {
    return value as VideoStatus;
  }
  return undefined;
};
