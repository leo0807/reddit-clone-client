import Head from 'next/head';
import { Fragment, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useSWR, { useSWRInfinite }from 'swr';
import Image from 'next/image';
import Link from 'next/link';

import { Post, Sub } from '../types';
import PostCard from '../components/PostCard';
import { useAuthState } from '../context/auth';

dayjs.extend(relativeTime);

export default function Home() {
  const [observedPost, setObservedPost] = useState('');
  const { authenticated } = useAuthState();
  // const { data: posts } = useSWR<Post[]>('/posts');
  const { data: topSubs } = useSWR<Sub[]>('/misc/top-subs');

  const description =
    "Reddit is a network of communities based on people's interests. Find communities you're interested in, and become part of an online community!";
  const title = 'readit: the front page of the internet';
  // infinite loading
  const {
    data,
    error,
    size: page,
    setSize: setPage,
    isValidating,
    revalidate
  } = useSWRInfinite<Post[]>((index) => `/posts?page=${index}`, {
    revalidateAll: true
  });
  const posts: Post[] = data ? [].concat(...data) : [];
  const isInitialLoading = !data && !error;

  // infinite loading

  useEffect(() => {
    if (!posts || posts.length === 0) return;
    // 最底部div ID
    const id = posts[posts.length - 1].identifier;
    if (id !== observedPost) {
      setObservedPost(id);
      observeElement(document.getElementById(id));
    }
  }, [posts]);

  const observeElement = (element: HTMLElement) => {
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting === true) {
          console.log('Bottom reached');
          
          setPage(page + 1);
          observer.unobserve(element);
        }
      },
      // 0 代表 top， 1代表 bottom
      { threshold: 1 }
    );

    observer.observe(element);
  };

  return (
    <Fragment>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description} />
        <meta property='og:description' content={description} />
        <meta property='og:title' content={title} />
        <meta property='twitter:description' content={description} />
        <meta property='twitter:title' content={title} />
      </Head>
      <div className='container flex pt-4'>
        {/* Post feed */}
        <div className='w-full px-4 md:w-160 md:p-0'>
          {isInitialLoading && <p className='text-lg text-center'>Loading..</p>}
          {posts?.map((post) => (
            <PostCard
              post={post}
              key={post.identifier}
              revalidate={revalidate}
            />
          ))}
          {isValidating && posts.length > 0 && (
            <p className='text-lg text-center'>Loading More..</p>
          )}
        </div>
        {/* Sidebar */}

        <div className='hidden ml-6 w-80 md:block'>
          <div className='bg-white rounded'>
            <div className='p-4 border-b-2'>
              <p className='text-lg font-semibold text-center'>
                Top Communities
              </p>
            </div>
            <div>
              {topSubs?.map((sub) => (
                <div
                  key={sub.name}
                  className='flex items-center px-4 py-2 text-xs border-b'>
                  <Link href={`/r/${sub.name}`}>
                    <a>
                      <Image
                        src={sub.imageUrl}
                        className='rounded-full cursor-pointer'
                        alt='Sub'
                        width={(6 * 16) / 4}
                        height={(6 * 16) / 4}
                      />
                    </a>
                  </Link>

                  <Link href={`/r/${sub.name}`}>
                    <a className='ml-2 font-bold hover:cursor-pointer'>
                      /r/{sub.name}
                    </a>
                  </Link>
                  <p className='ml-auto font-med'>{sub.postCount}</p>
                </div>
              ))}
            </div>
            {authenticated && (
              <div className='p-4 border-t-2'>
                <Link href='/subs/create'>
                  <a className='w-full px-2 py-1 blue button'>
                    Create Community
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}