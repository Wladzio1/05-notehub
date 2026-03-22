import { useState } from "react";
import css from "./App.module.css";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";

import SearchBox from "../SearchBox/SearchBox";
import NoteList from "../NoteList/NoteList";
import NoteForm from "../NoteForm/NoteForm";
import Modal from "../Modal/Modal";
import Pagination from "../Pagination/Pagination";

import { fetchNotes, createNote } from "../../services/noteService";
import type { Note } from "../../types/note";

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export default function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<FetchNotesResponse, Error>({
    queryKey: ["notes", page, search],
    queryFn: () => fetchNotes(page, 12, search),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setIsOpen(false);
    },
  });

  const handleSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onChange={handleSearch} />

        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={page}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0 });
            }}
          />
        )}

        <button className={css.button} onClick={() => setIsOpen(true)}>
          Create note +
        </button>
      </header>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Error loading notes...</p>}

      {data?.notes.length ? (
        <NoteList notes={data.notes} />
      ) : (
        <p>No notes found</p>
      )}

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <NoteForm
            onSubmit={(values) => createMutation.mutate(values)}
            onCancel={() => setIsOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
