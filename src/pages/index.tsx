import { format } from 'date-fns';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { AiOutlineCalendar } from 'react-icons/ai';
import { BsPerson } from 'react-icons/bs';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

export interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function getMorePosts() {
    await fetch(nextPage)
      .then(data => data.json())
      .then(response => {
        const postsResponse = response.results.map(post => {
          return {
            uid: post.uid,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
            first_publication_date: post.first_publication_date,
          };
        });
        setPosts([...postsResponse, ...posts]);
        setNextPage(response.next_page);
      });
  }

  return (
    <>
      <Header />
      <main className={styles.home}>
        <div className={styles.posts}>
          {posts.map((post: Post) => {
            return (
              <Link key={post.uid} href={`post/${post.uid}`}>
                <a>
                  <strong>
                    {post.data.title}
                  </strong>
                  <span>{post.data.subtitle}</span>
                  <div className={styles.info}>
                    <div className={styles.postCreatedAt}>
                      <AiOutlineCalendar />
                      <time>
                        {format(
                          new Date(post.first_publication_date),
                          "dd MMM yyyy",
                          { locale: ptBR }
                        )}
                      </time>
                    </div>
                    <div className={styles.author}>
                      <BsPerson />
                      <span>
                        {post.data.author}
                      </span>
                    </div>
                  </div>
                </a>
              </Link>
            )
          })}
        </div>

        {nextPage && (
          <div className={styles.button}>
            <button type='button' onClick={getMorePosts}>
              Carregar mais posts
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('posts', {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
  });


  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      },
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};