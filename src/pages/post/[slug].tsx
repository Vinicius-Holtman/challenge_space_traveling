import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { AiOutlineCalendar } from 'react-icons/ai';
import { BsPerson } from 'react-icons/bs';
import { Header } from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();
  
  if (isFallback) {
    return <h1>Carregando...</h1>;
  }

  const formatDate = (date: Date): string => {
    return format(date, 'dd MMM yyyy', { locale: ptBR });
  };

  const sumTotalWords = post.data.content.reduce((sumTotal, itemText) => {
    const totalWords = itemText.body.map(item => item.text.split(' ').length);
    totalWords.forEach(word => (sumTotal += word));
    return sumTotal;
  }, 0);

  const wordsReadPerMinute = 200;

  const readWordsByMinute = Math.ceil(sumTotalWords / wordsReadPerMinute);

  return (
    <>
      <Header />
      <img
        src="https://picsum.photos/1440/400"
        className={styles.banner}
        alt="banner"
      />
      <main className={styles.container}>
        <div className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.heading}>
            <div>
              <AiOutlineCalendar />
              {formatDate(new Date(post.first_publication_date))}
            </div>
            <div>
              <BsPerson />
              <span>{post.data.author}</span>
            </div>
            <div>
              <AiOutlineCalendar />
              <span>{readWordsByMinute} min</span>
            </div>
          </div>
          <div className={styles.content}>
            {post.data.content.map(content => {
              return (
                <article key={content.heading}>
                  <h1>{content.heading}</h1>
                  <div
                    // eslint-disable-next-line react/no-danger
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getAllByType('posts', {
    fetch: ['post.uid'],
    pageSize: 100,
  });

  const paths = posts.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths: paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};