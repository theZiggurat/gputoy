import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma'
import { User } from '.prisma/client';
import React from 'react';
import Scaffold from '../src/components/scaffold';
import ReactJson from 'react-json-view'
import { getSession } from 'next-auth/client';
import { Center } from '@chakra-ui/react';

export const getServerSideProps: GetServerSideProps = async ({ req, res}) => {
  const session = await getSession({req})
  console.log('test', session)
  if (!session) {
    res.statusCode = 403;
    return { props: { projects: [] } };
  }
  
  const projects = await prisma.project.findMany({
    where: {
      authorId: session.user?.id
    }
  })
  return {
    props: {
      projects: projects
    },
  };
};

const TestPage = (props: {projects}) => {
  return <Scaffold>
    <Center width="100%" height="100%" flexDirection="column">
      <ReactJson src={props.projects} theme="ocean" displayObjectSize={false} collapseStringsAfterLength={15} displayDataTypes={false}/>
    </Center>
  </Scaffold>
}

export default TestPage