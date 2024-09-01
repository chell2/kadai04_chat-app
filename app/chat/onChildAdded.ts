import { useEffect, useState } from 'react';
import { getDatabase, onChildAdded, ref } from '@firebase/database';
import { FirebaseError } from '@firebase/util';

export const App = () => {
  const [chats, setChats] = useState<{ message: string }[]>([]);

  useEffect(() => {
    try {
      const db = getDatabase();
      const dbRef = ref(db, 'chat');
      return onChildAdded(dbRef, (snapshot) => {
        const value = snapshot.val();
        setChats((prev) => [...prev, { message: value.message }]);
      });
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error(e);
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
