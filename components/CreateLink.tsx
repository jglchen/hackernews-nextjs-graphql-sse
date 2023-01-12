import { useState, useRef } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';
import loaderStyles from '@/styles/loader.module.css';

const CREATE_LINK_MUTATION = gql`
  mutation PostMutation(
    $description: String!
    $url: String!
  ) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

const CreateLink = () => {
  const router = useRouter();
  const [formState, setFormState] = useState({
    description: '',
    url: ''
  });
  const [inputErr, setInputErr] = useState('');
  const descriptionEl = useRef<HTMLInputElement | null>(null);
  const urlEl = useRef<HTMLInputElement | null>(null);

  const [createLink, {data: createData, loading: createLoading, error: createError}] = useMutation(CREATE_LINK_MUTATION, {
    variables: {
      description: formState.description,
      url: formState.url
    },
    /*
    update: (cache, {data: {post}}) => {
      const take = LINKS_PER_PAGE;
      const skip = 0;
      const orderBy = {createdAt: 'desc'};

      const data = cache.readQuery({
        query: FEED_QUERY,
        variables: {
          take,
          skip,
          orderBy
        }
      });

      cache.writeQuery({
        query: FEED_QUERY,
        data: {
          feed: {
            links: [post, ...data.feed.links]
          }
        },
        variables: {
          take,
          skip,
          orderBy
        }
      });
    },*/
    onCompleted: () => {
      router.push('/new/1')
    },
    onError: (err) => {
      //console.log(err);
    }
  });
  
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setInputErr('');
          if (!formState.description){
             setInputErr('Please enter description');
             descriptionEl.current?.focus();
             return;
          }
          if (!formState.url){
            setInputErr('Please enter url');
            urlEl.current?.focus();
            return;
          }
          createLink();
        }}
      >
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={formState.description}
            onChange={(e) =>
              setFormState({
                ...formState,
                description: e.target.value
              })
            }
            type="text"
            placeholder="A description for the link"
            ref={descriptionEl}
          />
          <input
            className="mb2"
            value={formState.url}
            onChange={(e) =>
              setFormState({
                ...formState,
                url: e.target.value
              })
            }
            type="text"
            placeholder="The URL for the link"
            ref={urlEl}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <div className="f6 lh-copy red">{inputErr}</div>
      <div className="f6 lh-copy red">{createError && createError.message}</div>
      {createLoading &&
        <div className={loaderStyles.loadermodal}>
          <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
        </div>
      }
    </div>
  );
};

export default CreateLink;