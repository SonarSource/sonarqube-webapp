/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { Semaphore } from '../Semaphore';

describe('Semaphore', () => {
  it('runs tasks up to maxConcurrent immediately', async () => {
    const semaphore = new Semaphore(2);
    const started: number[] = [];

    const task = (id: number) =>
      semaphore.run(
        () =>
          new Promise<void>((resolve) => {
            started.push(id);
            resolve();
          }),
      );

    await Promise.all([task(1), task(2)]);
    expect(started).toEqual([1, 2]);
  });

  it('queues tasks beyond maxConcurrent and runs them as permits free', async () => {
    const semaphore = new Semaphore(2);
    const started: number[] = [];
    const resolvers: Array<() => void> = [];

    const makeTask = (id: number) =>
      semaphore.run(
        () =>
          new Promise<void>((resolve) => {
            started.push(id);
            resolvers.push(resolve);
          }),
      );

    const p1 = makeTask(1);
    const p2 = makeTask(2);
    const p3 = makeTask(3);

    // Only 2 tasks should have started; the 3rd is queued
    expect(started).toEqual([1, 2]);

    // Finish task 1 — task 3 should start.
    // An extra tick is needed: release() resolves the queued promise, but task 3's
    // .then() runs one microtask after the await-p1 continuation.
    resolvers[0]();
    await p1;
    await Promise.resolve();
    expect(started).toEqual([1, 2, 3]);

    resolvers[1]();
    resolvers[2]();
    await Promise.all([p2, p3]);
  });

  it('releases permit when the promise rejects', async () => {
    const semaphore = new Semaphore(1);
    const started: number[] = [];

    const failing = semaphore.run(() => Promise.reject(new Error('boom')));
    await expect(failing).rejects.toThrow('boom');

    // Permit must have been released — this task should run immediately
    await semaphore.run(
      () =>
        new Promise<void>((resolve) => {
          started.push(1);
          resolve();
        }),
    );

    expect(started).toEqual([1]);
  });

  it('releases permit when fn throws synchronously', async () => {
    const semaphore = new Semaphore(1);
    const started: number[] = [];

    const throwing = semaphore.run(() => {
      throw new Error('sync throw');
    });
    await expect(throwing).rejects.toThrow('sync throw');

    // Permit must have been released — this task should run immediately
    await semaphore.run(
      () =>
        new Promise<void>((resolve) => {
          started.push(1);
          resolve();
        }),
    );

    expect(started).toEqual([1]);
  });
});
