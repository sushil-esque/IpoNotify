import { getMe } from "@/api/auth";
import { useQuery } from "@tanstack/react-query";

function useAuth() {

  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
  const user = data?.data  

  
  return { user, isLoading, isLoggedIn: !!user, isError };
}


export default useAuth;
