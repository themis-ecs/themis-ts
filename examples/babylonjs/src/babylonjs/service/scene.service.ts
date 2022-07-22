import { Observable, ReplaySubject } from 'rxjs';
import { Scene } from '@babylonjs/core';
import { Injectable } from 'themis-ts';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private readonly scene$ = new ReplaySubject<Scene>(1);

  public getScene$(): Observable<Scene> {
    return this.scene$;
  }

  public setScene(scene: Scene): void {
    this.scene$.next(scene);
  }
}
