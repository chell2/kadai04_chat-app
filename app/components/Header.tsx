'use client';
import { chakra, Container, Heading, Button, useToast } from '@chakra-ui/react';
import { useAuthContext } from '@/feature/auth/AuthProvider';
import { FirebaseError } from '@firebase/util';
import { getAuth, signOut } from 'firebase/auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const Header = () => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      await signOut(auth);
      toast({
        title: 'ログアウトしました。',
        status: 'success',
        position: 'top',
      });
      router.push('/signin');
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <chakra.header py={4} bgColor={'blue.600'}>
      <Container maxW={'container.lg'}>
        <Heading color={'blue.600'}>
          {user ? (
            <Button
              colorScheme={'teal'}
              onClick={handleSignOut}
              isLoading={isLoading}
            >
              ログアウト
            </Button>
          ) : (
            'ログアウト中'
          )}
        </Heading>
      </Container>
    </chakra.header>
  );
};
