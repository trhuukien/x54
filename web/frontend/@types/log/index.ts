// @ts-ignore
import React  from 'react';
import { Socket } from 'socket.io-client';
export type LogContextProviderProps = {
  children: React.ReactNode,
};

export type LogContextType = {
  socket: Socket;
  initialized: boolean;
}
