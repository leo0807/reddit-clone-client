import Head from "next/head";
import { useRouter } from "next/router"
import React, { ChangeEvent, createRef, Fragment, useEffect, useState } from "react";
import useSWR from "swr";
import PostCard from "../../components/PostCard";
import { Sub } from '../../types'
import Image from 'next/image'
import { useAuthState } from "../../context/auth";
import classNames from 'classnames';
import Axios from 'axios';
import Sidebar from '../../components/Sidebar';
export default function SubPage() {
    // Local State
    const [ownSub, setOwnSub] = useState(false);
    // Global State
    const { authenticated, user } = useAuthState();
    // Utils
    const router = useRouter();

    const fileInputRef = createRef<HTMLInputElement>();

    // 页面刚加载的时候subName会为空
    const subName = router.query.sub;
    const { data: sub, error, mutate } = useSWR<Sub>(
        subName ? `/subs/${subName}` : null
    );
    useEffect(() => {
        
        if (!sub) return;
        // 如果该user是这个sub的creator，则可以改变此sub的bannerimage
        setOwnSub(authenticated && sub.username === user.username);
    }, [sub]);

    const openFileInput = (type: string) => {
        if(!ownSub) return;
        fileInputRef.current.name = type;
        fileInputRef.current.click();
    }

    const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', fileInputRef.current.name);

        try {
            await Axios.post<Sub>(`/subs/${sub.name}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            mutate();
        } catch (error) {
            console.log(error);
        }
    }
    error && router.push('/');
    
    let postMarkUp
    if (!sub) {
        postMarkUp = <p className="text-lg text-center">Loading...</p>
    } else if (sub.posts.length === 0) {
        postMarkUp = <p className="text-lg text-center">No posts submitted yet</p>
    } else {
        postMarkUp = sub.posts.map(post => (
            // 传入revalidate，实时更新
                        <PostCard key={post.identifier} post={post} revalidate={mutate} />
                    ))
    }
    return (
        <div>
            <Head>
                <title>{sub?.title}</title>
            </Head>
                {sub && (
                <Fragment>
                    <input type="file" hidden={true} ref={fileInputRef} onChange={uploadImage} />
                        {/* Sub info and images */}
                    <div>
                        {/* Banner Image */}
                            <div className={classNames("bg-blue-500", {'cursor-pointer': ownSub})} onClick={()=>openFileInput('banner')}>
                                {sub.bannerUrl ? (
                                    <div className="h-56 bg-blue-500" style={{
                                        backgroundImage: `url(${sub.bannerUrl})`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}></div>
                                ) : 
                                    (<div className="h-20 bg-blue-500"></div>)
                                }
                        </div>
                        {/* Sub meta data */}
                        <div className="h-20 bg-white">
                            <div className="container relative flex">
                                <div className="absolute" style={{top: -15}}>
                                    <Image src={sub.imageUrl} alt='sub image'
                                        className={classNames("rounded-full", { 'cursor-pointer': ownSub })}
                                        width={70} height={70}
                                        onClick={()=>openFileInput('image')}
                                    />
                                </div>
                                <div className="pt-1 pl-24">
                                    <div className="flex items-center">
                                        <h1 className="mb-1 text-3xl font-bold">{sub.title }</h1>
                                    </div>
                                    <p className="text-sm font-bold text-gray-500">/r/{sub.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Posts & Sidebar */}
                    <div className="container flex pt-5">
                        <div className="w-160">{postMarkUp}</div>
                        <Sidebar sub={sub} />
                    </div>
                    </Fragment>
                )}
        </div>
    )
}
