import { memo, useCallback, useState } from 'react';
import { Button } from '@shopify/polaris';
import PropTypes from 'prop-types';
import { useAuthenticatedFetch } from '~/hooks/index.js';
import { useToast } from '@shopify/app-bridge-react'

const useButton = ({ buildBody }) => {
  const fetch = useAuthenticatedFetch();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleCheck = useCallback(async () => {

    try {
      const payload = buildBody();
      setIsLoading(true);
      const response = await fetch('/api/hogia/test-token', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (response.ok) {
        toast.show(data.message, { isError: !data.success });
      } else {
        toast.show('Test connection error.', { isError: true });
      }
    } catch (e) {
      console.log(e);
      toast.show(e.message, { isError: true });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    handleCheck,
    isLoading,
  };
};


const TestConnection = (props) => {
  const { buildBody } = props;
  const { handleCheck, isLoading } = useButton({ buildBody });

  return (
    <>
      <Button
        variant='primary'
        tone='success'
        onClick={handleCheck}
        loading={isLoading}
      >
        Test connection
      </Button>
    </>
  );
}
TestConnection.propTypes = {
  onError: PropTypes.func,
  buildBody: PropTypes.func.isRequired,
};
export default memo(TestConnection);