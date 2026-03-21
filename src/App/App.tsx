import { useState } from "react";
import css from "./App.module.css";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import { useDebouncedCallback } from "use-debounce";

import SearchBox from "../SearchBox/SearchBox";
import NoteList from "../NoteList/NoteList";
import NoteForm from "../NoteForm/NoteForm";
import Modal from "../Modal/Modal";

import { fetchNotes, deleteNote, createNote } from "../services/noteService";

export default function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", page, search],
    queryFn: () => fetchNotes(page, 12, search),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
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
          <ReactPaginate
            pageCount={data.totalPages}
            onPageChange={({ selected }) => {
              setPage(selected + 1);
              window.scrollTo({ top: 0 });
            }}
            forcePage={page - 1}
          />
        )}

        <button onClick={() => setIsOpen(true)}>Create note +</button>
      </header>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Error...</p>}

      {data && data.notes.length > 0 && (
        <NoteList
          notes={data.notes}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
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
