import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

/** Réponses de l'API : toutes enveloppées dans { data }. */
interface ApiEnvelope<T> {
  data: T;
}

/**
 * Client HTTP centralisé : préfixe /api/v1 (proxifié vers AdonisJS en
 * dev, servi par le reverse proxy en prod) et déballage de { data }.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';

  get<T>(path: string, params?: Record<string, string | number | undefined>): Observable<T> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return this.http
      .get<ApiEnvelope<T>>(`${this.baseUrl}${path}`, { params: httpParams })
      .pipe(map((envelope) => envelope.data));
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http
      .post<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body ?? {})
      .pipe(map((envelope) => envelope.data));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((envelope) => envelope.data));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((envelope) => envelope.data));
  }

  delete(path: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${path}`);
  }
}
