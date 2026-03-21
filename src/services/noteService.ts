import axios from "axios";
import type { Note } from "../types/note";

const BASE_URL = "https://notehub-public.goit.study/api/notes";
const TOKEN = import.meta.env.VITE_NOTEHUB_TOKEN;

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

// 👇 NOWY TYP (WAŻNE)
export interface CreateNotePayload {
  title: string;
  content: string;
  tag: string;
}

// GET
export async function fetchNotes(
  page: number,
  perPage: number,
  search: string,
): Promise<FetchNotesResponse> {
  const res = await axios.get<FetchNotesResponse>(BASE_URL, {
    params: { page, perPage, search },
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return res.data;
}

// CREATE ✅
export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const res = await axios.post<Note>(BASE_URL, payload, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return res.data;
}

// DELETE
export async function deleteNote(id: string): Promise<Note> {
  const res = await axios.delete<Note>(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return res.data;
}
